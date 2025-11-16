/**
 * Google Docs to Lexical Parser
 * 
 * Converts Google Docs API response to Payload CMS Lexical format
 */

import type { docs_v1 } from 'googleapis'

export interface LexicalNode {
  type: string
  children?: LexicalNode[]
  text?: string
  detail?: number
  format?: number | string // number for text nodes, string for block nodes
  mode?: string
  style?: string
  version: number
  direction?: 'ltr' | 'rtl'
  indent?: number
  tag?: string
  textFormat?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields?: any
}

export interface LexicalRoot {
  root: {
    type: 'root'
    children: LexicalNode[]
    direction: 'ltr' | null
    format: '' | 'left' | 'start' | 'center' | 'right' | 'end' | 'justify'
    indent: number
    version: number
  }
}

/**
 * Convert Google Docs format flags to Lexical format flags
 * Google Docs: BOLD=1, ITALIC=2, UNDERLINE=4, STRIKETHROUGH=8
 * Lexical: BOLD=1, ITALIC=2, UNDERLINE=4
 */
function convertFormatFlags(googleFormat: docs_v1.Schema$TextStyle | undefined): number {
  if (!googleFormat) return 0
  
  let format = 0
  if (googleFormat.bold) format |= 1 // BOLD
  if (googleFormat.italic) format |= 2 // ITALIC
  if (googleFormat.underline) format |= 4 // UNDERLINE
  
  return format
}

/**
 * Convert Google Docs heading style to Lexical heading tag
 */
function getHeadingTag(paragraphStyle: docs_v1.Schema$ParagraphStyle | undefined): string | undefined {
  if (!paragraphStyle?.namedStyleType) return undefined
  
  const styleType = paragraphStyle.namedStyleType
  if (styleType?.startsWith('HEADING_')) {
    const level = styleType.replace('HEADING_', '')
    return `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'
  }
  
  return undefined
}

/**
 * Check if paragraph is a list item
 * @deprecated Not currently used
 */
function _isListItem(paragraph: docs_v1.Schema$Paragraph): boolean {
  return !!paragraph.bullet
}

/**
 * Get list nesting level
 */
function getListNestingLevel(paragraph: docs_v1.Schema$Paragraph): number {
  if (!paragraph.bullet) return 0
  return paragraph.bullet.nestingLevel || 0
}

/**
 * Parse a text run with formatting
 */
function parseTextRun(run: docs_v1.Schema$TextRun): LexicalNode {
  const format = convertFormatFlags(run.textStyle)
  
  return {
    type: 'text',
    detail: 0,
    format,
    mode: 'normal',
    style: '',
    text: run.content || '',
    version: 1,
  }
}

/**
 * Parse a paragraph element
 */
function parseParagraph(
  paragraph: docs_v1.Schema$Paragraph,
  _doc: docs_v1.Schema$Document
): LexicalNode | null {
  if (!paragraph.elements || paragraph.elements.length === 0) {
    return null
  }

  const headingTag = getHeadingTag(paragraph.paragraphStyle)
  // const isList = isListItem(paragraph) // Not currently used
  const nestingLevel = getListNestingLevel(paragraph)

  // Parse text elements
  const children: LexicalNode[] = []
  
  for (const element of paragraph.elements) {
    if (element.textRun) {
      const textNode = parseTextRun(element.textRun)
      if (textNode.text) {
        children.push(textNode)
      }
    } else if (element.inlineObjectElement) {
      // Handle inline images - we'll process these separately
      // For now, we'll skip them and handle in image processing step
    }
  }

  if (children.length === 0) {
    return null
  }

  // Create heading node
  if (headingTag) {
    return {
      type: 'heading',
      children,
      direction: 'ltr',
      format: '',
      indent: nestingLevel,
      tag: headingTag,
      version: 1,
    }
  }

  // Create paragraph node
  return {
    type: 'paragraph',
    children,
    direction: 'ltr',
    format: '',
    indent: nestingLevel,
    textFormat: 0,
    version: 1,
  }
}

/**
 * Parse a table element
 */
function parseTable(table: docs_v1.Schema$Table): LexicalNode[] {
  const nodes: LexicalNode[] = []
  
  if (!table.tableRows) return nodes

  for (const row of table.tableRows) {
    if (!row.tableCells) continue
    
    const rowTexts: string[] = []
    
    for (const cell of row.tableCells) {
      if (!cell.content) continue
      
      const cellTexts: string[] = []
      for (const element of cell.content) {
        if (element.paragraph?.elements) {
          for (const paraElement of element.paragraph.elements) {
            if (paraElement.textRun?.content) {
              cellTexts.push(paraElement.textRun.content)
            }
          }
        }
      }
      
      rowTexts.push(cellTexts.join(''))
    }
    
    // Create a paragraph with table row content
    if (rowTexts.length > 0) {
      nodes.push({
        type: 'paragraph',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: rowTexts.join(' | '),
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        version: 1,
      })
    }
  }
  
  return nodes
}

/**
 * Main parser function - converts Google Doc to Lexical format
 */
export function parseGoogleDocToLexical(doc: docs_v1.Schema$Document): LexicalRoot {
  const children: LexicalNode[] = []

  if (!doc.body?.content) {
    return {
      root: {
        type: 'root',
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    }
  }

  for (const structuralElement of doc.body.content) {
    // Parse paragraphs
    if (structuralElement.paragraph) {
      const node = parseParagraph(structuralElement.paragraph, doc)
      if (node) {
        children.push(node)
      }
    }
    // Parse tables
    else if (structuralElement.table) {
      const tableNodes = parseTable(structuralElement.table)
      children.push(...tableNodes)
    }
  }

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

/**
 * Extract inline images from Google Doc
 */
export function extractInlineImages(doc: docs_v1.Schema$Document): Array<{
  inlineObjectId: string
  objectId: string
}> {
  const images: Array<{ inlineObjectId: string; objectId: string }> = []

  if (!doc.body?.content) return images

  for (const structuralElement of doc.body.content) {
    if (structuralElement.paragraph?.elements) {
      for (const element of structuralElement.paragraph.elements) {
        if (element.inlineObjectElement?.inlineObjectId) {
          const inlineObjectId = element.inlineObjectElement.inlineObjectId
          // We'll need to get the objectId from the inlineObjects map
          if (doc.inlineObjects?.[inlineObjectId]) {
            const inlineObject = doc.inlineObjects[inlineObjectId]
            if (inlineObject.inlineObjectProperties?.embeddedObject?.imageProperties?.contentUri) {
              // Extract object ID from content URI or use inlineObjectId
              images.push({
                inlineObjectId,
                objectId: inlineObjectId, // We'll use this to fetch the image
              })
            }
          }
        }
      }
    }
  }

  return images
}

