#!/usr/bin/env tsx
/**
 * Auto-generates AI prompt from Payload CMS block definitions
 * Run this script whenever you add new blocks to update the AI prompt automatically
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

interface BlockField {
  name: string
  type: string
  label?: string | false
  required?: boolean
  defaultValue?: string
  options?: Array<{ label: string; value: string }>
  fields?: BlockField[]
  admin?: {
    description?: string
  }
}

interface BlockDefinition {
  slug: string
  interfaceName?: string
  fields: BlockField[]
  labels?: {
    singular?: string
    plural?: string
  }
}

interface BlocksJSON {
  blocks: BlockDefinition[]
}

/**
 * Generate field description for AI prompt
 */
function describeField(field: BlockField, indent = 0): string {
  const indentStr = '  '.repeat(indent)
  let desc = `${indentStr}- ${field.name}: ${field.type}`
  
  if (field.required) {
    desc += ' (required)'
  }
  
  if (field.defaultValue) {
    desc += ` (default: ${field.defaultValue})`
  }
  
  if (field.options) {
    const values = field.options.map(opt => opt.value).join(' | ')
    desc += ` - options: ${values}`
  }
  
  if (field.admin?.description) {
    desc += ` - ${field.admin.description}`
  }
  
  if (field.fields && field.fields.length > 0) {
    desc += '\n' + field.fields.map(f => describeField(f, indent + 1)).join('\n')
  }
  
  return desc
}

/**
 * Generate block structure description
 */
function generateBlockStructure(block: BlockDefinition): string {
  const lines: string[] = []
  lines.push(`${block.interfaceName || block.slug} Block Structure:`)
  lines.push(`- blockType: "${block.slug}"`)
  
  block.fields.forEach(field => {
    if (field.type === 'richText') {
      lines.push(`- ${field.name}: richText (Lexical format)`)
    } else if (field.type === 'array') {
      lines.push(`- ${field.name}: Array of {`)
      if (field.fields) {
        field.fields.forEach(subField => {
          if (subField.type === 'richText') {
            lines.push(`  ${subField.name}: richText (Lexical format)`)
          } else {
            lines.push(`  ${subField.name}: ${subField.type}`)
          }
        })
      }
      lines.push(`}`)
    } else if (field.type === 'select' && field.options) {
      const values = field.options.map(opt => `"${opt.value}"`).join(' | ')
      lines.push(`- ${field.name}: ${values}`)
    } else {
      lines.push(`- ${field.name}: ${field.type}${field.required ? ' (required)' : ' (optional)'}`)
    }
  })
  
  return lines.join('\n')
}

/**
 * Generate block marker instructions
 */
function generateBlockMarkerInstructions(block: BlockDefinition): string {
  const blockName = block.slug.toUpperCase()
  const blockLabel = block.labels?.singular || block.slug
  const marker = `##${blockName}`
  
  let instructions = `1. \\\`${marker}\\\` - ${blockLabel.charAt(0).toUpperCase() + blockLabel.slice(1)} Block Marker`
  
  // Special handling for FAQ - add CRITICAL note
  if (block.slug === 'faq') {
    instructions += ` (CRITICAL - DO NOT REMOVE FAQ SECTIONS)`
  }
  
  instructions += `\n   When you see \\\`${marker}\\\` or \\\`${marker}...\` (with additional text), you MUST:\n`
  
  // Special handling for different block types
  if (block.slug === 'faq') {
    instructions += `   - KEEP the entire FAQ section in your response\n`
    instructions += `   - Format questions on separate lines (as headings or paragraphs ending with "?")\n`
    instructions += `   - Format answers on separate lines immediately following each question\n`
    instructions += `   - If questions and answers are on the same line, split them into separate lines\n`
    instructions += `   - Preserve all original text exactly\n`
    instructions += `   \n   EXAMPLE INPUT:\n`
    instructions += `   \\\`\\\`\\\`\n`
    instructions += `   ##FAQFrequently Asked Questions\n`
    instructions += `   \n`
    instructions += `   What platforms is Terra Nova available on? Terra Nova is available on Windows and Mac.\n`
    instructions += `   \n`
    instructions += `   Can I play multiplayer? Yes, multiplayer mode allows you to form alliances.\n`
    instructions += `   \\\`\\\`\\\`\n`
    instructions += `   \n`
    instructions += `   EXAMPLE OUTPUT (format structure, preserve text):\n`
    instructions += `   \\\`\\\`\\\`\n`
    instructions += `   ##FAQ\n`
    instructions += `   \n`
    instructions += `   Frequently Asked Questions\n`
    instructions += `   \n`
    instructions += `   What platforms is Terra Nova available on?\n`
    instructions += `   Terra Nova is available on Windows and Mac.\n`
    instructions += `   \n`
    instructions += `   Can I play multiplayer?\n`
    instructions += `   Yes, multiplayer mode allows you to form alliances.\n`
    instructions += `   \\\`\\\`\\\``
  } else if (block.slug === 'code') {
    instructions += `   - Preserve all code exactly as written\n`
    instructions += `   - Keep code formatting intact\n`
    instructions += `   - Preserve all original text exactly`
  } else if (block.slug === 'banner') {
    instructions += `   - Preserve the text exactly\n`
    instructions += `   - Keep it as a single block of content\n`
    instructions += `   - Preserve all original text exactly`
  } else if (block.slug === 'mediaBlock' || block.slug === 'media') {
    instructions += `   - Preserve captions and descriptions exactly\n`
    instructions += `   - Preserve all original text exactly`
  } else {
    instructions += `   - Preserve the content exactly\n`
    instructions += `   - Format structure for automatic block detection\n`
    instructions += `   - Preserve all original text exactly`
  }
  
  return instructions
}

/**
 * Generate the complete AI prompt section
 */
function generateAIPrompt(blocks: BlockDefinition[]): string {
  const lines: string[] = []
  
  lines.push('BLOCK MARKERS & FORMATTING:')
  lines.push('The content may contain special block markers that indicate Payload CMS blocks. When you see these markers, format the content structure (not the text) to make it parseable:')
  lines.push('')
  
  // Generate marker instructions (number them correctly)
  blocks.forEach((block, index) => {
    const instruction = generateBlockMarkerInstructions(block)
    // Replace the number at the start with the correct index
    const numberedInstruction = instruction.replace(/^\d+\./, `${index + 1}.`)
    lines.push(numberedInstruction)
    lines.push('')
  })
  
  lines.push('PAYLOAD CMS BLOCK STRUCTURES:')
  lines.push('')
  
  // Generate block structures
  blocks.forEach(block => {
    lines.push(generateBlockStructure(block))
    lines.push('')
  })
  
  return lines.join('\n')
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Reading block definitions...')
  
  const blocksJsonPath = join(process.cwd(), 'payload-blocks.json')
  const aiFormatterPath = join(process.cwd(), 'src', 'utilities', 'aiFormatter.ts')
  
  // Read blocks JSON
  const blocksJson: BlocksJSON = JSON.parse(readFileSync(blocksJsonPath, 'utf-8'))
  console.log(`✅ Found ${blocksJson.blocks.length} blocks`)
  
  // Filter blocks that should have markers (exclude form, archive, etc. that are not content blocks)
  const contentBlocks = blocksJson.blocks.filter(block => {
    // Include blocks that are typically used in content
    const contentBlockSlugs = ['faq', 'banner', 'code', 'mediaBlock', 'cta', 'content']
    return contentBlockSlugs.includes(block.slug)
  })
  
  console.log(`📝 Generating prompt for ${contentBlocks.length} content blocks...`)
  
  // Generate prompt
  const generatedPrompt = generateAIPrompt(contentBlocks)
  
  // Read current aiFormatter.ts
  let aiFormatterContent = readFileSync(aiFormatterPath, 'utf-8')
  
  // Find and replace the BLOCK MARKERS & FORMATTING section
  // Look for the section that starts with "BLOCK MARKERS & FORMATTING:" and ends before "YOUR TASK:"
  const startMarker = 'BLOCK MARKERS & FORMATTING:'
  const endMarker = 'YOUR TASK:'
  
  const startIndex = aiFormatterContent.indexOf(startMarker)
  const endIndex = aiFormatterContent.indexOf(endMarker)
  
  if (startIndex === -1 || endIndex === -1) {
    console.error('❌ Could not find prompt section markers in aiFormatter.ts')
    console.error('   Looking for:', startMarker, 'and', endMarker)
    process.exit(1)
  }
  
  // Find the actual end of the section (before "YOUR TASK:")
  // Go backwards from endMarker to find the last newline before it
  let sectionEnd = endIndex
  while (sectionEnd > startIndex && aiFormatterContent[sectionEnd - 1] !== '\n') {
    sectionEnd--
  }
  
  // Replace the section
  const before = aiFormatterContent.substring(0, startIndex)
  const after = aiFormatterContent.substring(sectionEnd)
  
  const newContent = before + generatedPrompt.trim() + '\n\n' + after
  
  // Write back
  writeFileSync(aiFormatterPath, newContent, 'utf-8')
  
  console.log('✅ AI prompt updated successfully!')
  console.log(`📄 Updated: ${aiFormatterPath}`)
  console.log(`\n📋 Blocks included in prompt:`)
  contentBlocks.forEach(block => {
    console.log(`   - ${block.slug} (##${block.slug.toUpperCase()})`)
  })
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('generate-ai-prompt')) {
  try {
    main()
  } catch (error) {
    console.error('❌ Error generating prompt:', error)
    process.exit(1)
  }
}

export { generateAIPrompt, generateBlockMarkerInstructions, generateBlockStructure }

