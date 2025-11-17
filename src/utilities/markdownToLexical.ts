/**
 * Markdown to Lexical Parser
 * Converts markdown-formatted text (from AI) into Lexical nodes
 * Handles tables, lists, headings, and paragraphs
 */

import type { LexicalNode, LexicalRoot } from './googleDocsParser'

/**
 * Parse markdown table to Lexical table node
 */
function parseMarkdownTable(tableText: string): LexicalNode | null {
  const lines = tableText.trim().split('\n').filter(line => line.trim())
  if (lines.length < 2) return null // Need at least header and separator

  const rows: string[][] = []
  
  for (const line of lines) {
    // Skip separator line (|---|---|)
    if (line.match(/^\|[\s\-:]+\|$/)) continue
    
    // Parse table row
    const cells = line
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0) // Remove empty cells from split
    
    if (cells.length > 0) {
      rows.push(cells)
    }
  }

  if (rows.length === 0) return null

  const columnCount = rows[0]?.length || 0
  const tableRows: LexicalNode[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const tableCells: LexicalNode[] = []

    for (const cellText of row) {
      tableCells.push({
        type: 'tablecell',
        children: [{
          type: 'text',
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: cellText,
          version: 1,
        }],
        direction: 'ltr',
        format: '',
        version: 1,
      })
    }

    // Pad cells if needed
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

    tableRows.push({
      type: 'tablerow',
      children: tableCells,
      direction: 'ltr',
      format: '',
      version: 1,
    })
  }

  return {
    type: 'table',
    children: tableRows,
    direction: 'ltr',
    format: '',
    version: 1,
    rowCount: tableRows.length,
    columnCount,
  }
}

/**
 * Parse markdown text to Lexical format
 */
export function parseMarkdownToLexical(markdown: string): LexicalRoot {
  const children: LexicalNode[] = []
  const lines = markdown.split('\n')
  
  let i = 0
  let currentTable: string[] = []
  
  while (i < lines.length) {
    const line = lines[i]
    
    // Check for markdown table
    if (line.includes('|') && line.trim().startsWith('|')) {
      currentTable.push(line)
      i++
      continue
    }
    
    // If we were collecting a table, parse it
    if (currentTable.length > 0) {
      const tableNode = parseMarkdownTable(currentTable.join('\n'))
      if (tableNode) {
        children.push(tableNode)
      }
      currentTable = []
    }
    
    // Parse headings
    if (line.startsWith('# ')) {
      children.push({
        type: 'heading',
        children: [{
          type: 'text',
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: line.substring(2).trim(),
          version: 1,
        }],
        direction: 'ltr',
        format: '',
        indent: 0,
        tag: 'h1',
        version: 1,
      })
    } else if (line.startsWith('## ')) {
      children.push({
        type: 'heading',
        children: [{
          type: 'text',
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: line.substring(3).trim(),
          version: 1,
        }],
        direction: 'ltr',
        format: '',
        indent: 0,
        tag: 'h2',
        version: 1,
      })
    } else if (line.startsWith('### ')) {
      children.push({
        type: 'heading',
        children: [{
          type: 'text',
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: line.substring(4).trim(),
          version: 1,
        }],
        direction: 'ltr',
        format: '',
        indent: 0,
        tag: 'h3',
        version: 1,
      })
    } else if (line.startsWith('#### ')) {
      children.push({
        type: 'heading',
        children: [{
          type: 'text',
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text: line.substring(5).trim(),
          version: 1,
        }],
        direction: 'ltr',
        format: '',
        indent: 0,
        tag: 'h4',
        version: 1,
      })
    } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      // Bullet list
      const text = line.replace(/^[\s\-*]+\s*/, '').trim()
      if (text) {
        children.push({
          type: 'paragraph',
          children: [{
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: `• ${text}`,
            version: 1,
          }],
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          version: 1,
        })
      }
    } else if (line.match(/^\d+\.\s/)) {
      // Numbered list
      const text = line.replace(/^\d+\.\s*/, '').trim()
      if (text) {
        children.push({
          type: 'paragraph',
          children: [{
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: text,
            version: 1,
          }],
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          version: 1,
        })
      }
    } else if (line.trim()) {
      // Regular paragraph
      // Parse bold and italic
      let format = 0
      let text = line.trim()
      
      // Simple markdown parsing for bold (**text**)
      text = text.replace(/\*\*(.+?)\*\*/g, (match, content) => {
        format = 1 // Bold
        return content
      })
      
      children.push({
        type: 'paragraph',
        children: [{
          type: 'text',
          detail: 0,
          format,
          mode: 'normal',
          style: '',
          text,
          version: 1,
        }],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        version: 1,
      })
    }
    
    i++
  }
  
  // Handle any remaining table
  if (currentTable.length > 0) {
    const tableNode = parseMarkdownTable(currentTable.join('\n'))
    if (tableNode) {
      children.push(tableNode)
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

