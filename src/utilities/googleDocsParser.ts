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
  value?: number // For list items
  listType?: 'bullet' | 'number' // For list nodes
  start?: number // For numbered lists
  // Table node properties
  rowCount?: number
  columnCount?: number
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
 */
function isListItem(paragraph: docs_v1.Schema$Paragraph): boolean {
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
 * Get list type and bullet character from document lists metadata
 */
function getListBulletInfo(
  paragraph: docs_v1.Schema$Paragraph,
  doc: docs_v1.Schema$Document
): { type: 'bullet' | 'number'; glyph: string; nestingLevel: number } {
  if (!paragraph.bullet) {
    return { type: 'bullet', glyph: '•', nestingLevel: 0 }
  }
  
  const listId = paragraph.bullet.listId
  const nestingLevel = paragraph.bullet.nestingLevel || 0
  
  // Check document's lists to determine bullet style
  if (doc.lists && listId && doc.lists[listId]) {
    const list = doc.lists[listId]
    
    if (list.listProperties?.nestingLevels) {
      // Get the nesting level configuration
      const levelConfig = list.listProperties.nestingLevels[nestingLevel] || list.listProperties.nestingLevels[0]
      
      if (levelConfig) {
        // Check if it's a numbered list - Google Docs uses glyphFormat for numbering
        const glyphFormat = levelConfig.glyphFormat
        if (glyphFormat && (glyphFormat.includes('DECIMAL') || glyphFormat.includes('NUMBER'))) {
          return { type: 'number', glyph: '1.', nestingLevel }
        }
        
        // Check glyphType for numbered lists
        if (levelConfig.glyphType === 'GLYPH_TYPE_NUMBER') {
          return { type: 'number', glyph: '1.', nestingLevel }
        }
        
        // Map glyph types to Unicode characters
        const glyphMap: Record<string, string> = {
          'GLYPH_TYPE_CIRCLE': '•',           // Circle bullet
          'GLYPH_TYPE_SQUARE': '■',           // Square bullet
          'GLYPH_TYPE_DIAMOND': '❖',          // Diamond bullet
          'GLYPH_TYPE_ARROW': '➤',            // Arrow/triangle bullet
          'GLYPH_TYPE_CHECKBOX': '☐',         // Checkbox
          'GLYPH_TYPE_ARROW_DOWN': '▼',        // Down arrow
          'GLYPH_TYPE_ARROW_UP': '▲',          // Up arrow
          'GLYPH_TYPE_ARROW_LEFT': '◄',        // Left arrow
          'GLYPH_TYPE_ARROW_RIGHT': '►',       // Right arrow
        }
        
        const glyphType = levelConfig.glyphType || ''
        // Use glyphSymbol if available (actual character from Google Docs), otherwise map from type
        const glyph = levelConfig.glyphSymbol || glyphMap[glyphType] || '•'
        
        // Clean up any invalid characters
        const cleanGlyph = glyph.replace(/\uFFFD/g, '').trim() || '•'
        
        return { type: 'bullet', glyph: cleanGlyph, nestingLevel }
      }
    }
  }
  
  // Default to circle bullet
  return { type: 'bullet', glyph: '•', nestingLevel }
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
  doc: docs_v1.Schema$Document
): LexicalNode | null {
  if (!paragraph.elements || paragraph.elements.length === 0) {
    return null
  }

  const headingTag = getHeadingTag(paragraph.paragraphStyle)
  const isList = isListItem(paragraph)
  const listInfo = isList ? getListBulletInfo(paragraph, doc) : null
  const nestingLevel = listInfo?.nestingLevel || getListNestingLevel(paragraph)

  // Parse text elements
  const children: LexicalNode[] = []
  
  for (const element of paragraph.elements) {
    if (element.textRun) {
      const textNode = parseTextRun(element.textRun)
      // Handle character encoding issues - ensure proper UTF-8 encoding
      if (textNode.text) {
        // Clean up any invalid characters
        try {
          textNode.text = textNode.text.replace(/\uFFFD/g, '') // Remove replacement characters
          children.push(textNode)
        } catch (e) {
          // If encoding fails, try to preserve the text
          console.warn('[Parser] Character encoding issue, attempting recovery:', e)
          children.push(textNode)
        }
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
      indent: 0, // Headings don't use nesting level
      tag: headingTag,
      version: 1,
    }
  }

  // Create list item node if this is a list
  if (isList && listInfo) {
    return {
      type: 'listitem',
      children,
      direction: 'ltr',
      format: '',
      indent: nestingLevel,
      value: nestingLevel + 1, // List item value (1-based)
      listType: listInfo.type,
      version: 1,
      // Store bullet glyph for later use
      fields: { bulletGlyph: listInfo.glyph },
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
 * Parse a table element to Lexical table format
 */
function parseTable(table: docs_v1.Schema$Table): LexicalNode {
  if (!table.tableRows || table.tableRows.length === 0) {
    // Return empty table
    return {
      type: 'table',
      children: [],
      direction: 'ltr',
      format: '',
      version: 1,
      rowCount: 0,
      columnCount: 0,
    }
  }

  // Determine column count from first row
  const firstRow = table.tableRows[0]
  const columnCount = firstRow?.tableCells?.length || 0
  const rowCount = table.tableRows.length

  // Parse table rows
  const tableRows: LexicalNode[] = []
  
  for (const row of table.tableRows) {
    if (!row.tableCells) continue
    
    // Parse table cells
    const tableCells: LexicalNode[] = []
    
    for (const cell of row.tableCells) {
      // Extract cell content
      const cellChildren: LexicalNode[] = []
      
      if (cell.content) {
        for (const element of cell.content) {
          if (element.paragraph?.elements) {
            // Parse paragraph elements in cell
            for (const paraElement of element.paragraph.elements) {
              if (paraElement.textRun) {
                const textNode = parseTextRun(paraElement.textRun)
                if (textNode.text) {
                  cellChildren.push(textNode)
                }
              }
            }
          }
        }
      }
      
      // If no content, add empty text node
      if (cellChildren.length === 0) {
        cellChildren.push({
          type: 'text',
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: '',
          version: 1,
        })
      }
      
      // Create table cell node
      tableCells.push({
        type: 'tablecell',
        children: cellChildren,
        direction: 'ltr',
        format: '',
        version: 1,
      })
    }
    
    // Ensure we have the right number of cells (pad with empty cells if needed)
    while (tableCells.length < columnCount) {
      tableCells.push({
        type: 'tablecell',
        children: [{
          type: 'text',
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: '',
          version: 1,
        }],
        direction: 'ltr',
        format: '',
        version: 1,
      })
    }
    
    // Create table row node
    tableRows.push({
      type: 'tablerow',
      children: tableCells,
      direction: 'ltr',
      format: '',
      version: 1,
    })
  }

  // Create table node
  return {
    type: 'table',
    children: tableRows,
    direction: 'ltr',
    format: '',
    version: 1,
    rowCount,
    columnCount,
  }
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

  // First pass: parse all elements
  const parsedNodes: LexicalNode[] = []
  
  for (const structuralElement of doc.body.content) {
    // Parse paragraphs
    if (structuralElement.paragraph) {
      const node = parseParagraph(structuralElement.paragraph, doc)
      if (node) {
        parsedNodes.push(node)
      }
    }
    // Parse tables
    else if (structuralElement.table) {
      const tableNode = parseTable(structuralElement.table)
      parsedNodes.push(tableNode)
    }
  }

  // Second pass: convert list items to paragraphs with proper bullet prefixes
  // (Lexical list nodes may not be available, so we use paragraphs with formatting)
  for (const node of parsedNodes) {
    if (node.type === 'listitem') {
      // Extract text from list item children while preserving formatting
      const listItemChildren = node.children || []
      
      // Get bullet glyph from stored fields or use default
      const bulletGlyph = (node.fields?.bulletGlyph as string) || '•'
      const indent = node.indent || 0
      const listType = node.listType || 'bullet'
      
      // Calculate proper indentation (2 spaces per level)
      const indentSpaces = '  '.repeat(indent)
      
      // For numbered lists, use simple numbering (will be improved later)
      // For bullet lists, use the actual glyph from Google Docs
      const bulletPrefix = listType === 'number' 
        ? `${indentSpaces}1. ` // TODO: Track sequential numbering
        : `${indentSpaces}${bulletGlyph} `
      
      // Create paragraph with bullet prefix and preserved formatting
      if (listItemChildren.length > 0) {
        // If we have formatted children, add bullet as first text node
        children.push({
          type: 'paragraph',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: bulletPrefix,
              version: 1,
            },
            ...listItemChildren, // Preserve original formatting
          ],
          direction: 'ltr',
          format: '',
          indent: indent,
          textFormat: 0,
          version: 1,
        })
      } else {
        // Fallback: create simple paragraph with bullet
        const listItemText = listItemChildren
          .map((child: LexicalNode) => child.text || '')
          .join('') || ''
        
        children.push({
          type: 'paragraph',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: `${bulletPrefix}${listItemText}`,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: indent,
          textFormat: 0,
          version: 1,
        })
      }
    } else {
      // Regular node, add it directly
      children.push(node)
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


