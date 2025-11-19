/**
 * Script to generate a comprehensive AI prompt file
 * 
 * This script scans the codebase and generates a single file containing:
 * - All block schemas
 * - Collection schemas
 * - Example structures
 * - API response formats
 * - Usage instructions
 * 
 * Run this script whenever block schemas or collections change.
 * 
 * Usage:
 *   npx tsx scripts/generate-ai-prompt-file.ts
 * 
 * Or add to package.json:
 *   "generate-ai-prompt": "tsx scripts/generate-ai-prompt-file.ts"
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Read file content helper
function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch (error) {
    return `// Error reading file: ${filePath}\n`
  }
}

// Get all block config files
function getBlockConfigs(): Array<{ name: string; path: string; content: string }> {
  const blocksDir = path.join(rootDir, 'src', 'blocks')
  const blocks: Array<{ name: string; path: string; content: string }> = []

  const blockDirs = fs.readdirSync(blocksDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())

  for (const blockDir of blockDirs) {
    const configPath = path.join(blocksDir, blockDir.name, 'config.ts')
    if (fs.existsSync(configPath)) {
      blocks.push({
        name: blockDir.name,
        path: configPath,
        content: readFile(configPath),
      })
    }
  }

  return blocks
}

// Get collection files
function getCollectionConfigs(): Array<{ name: string; path: string; content: string }> {
  const collectionsDir = path.join(rootDir, 'src', 'collections')
  const collections: Array<{ name: string; path: string; content: string }> = []

  const collectionFiles = fs.readdirSync(collectionsDir, { withFileTypes: true })
    .filter(dirent => dirent.isFile() && dirent.name.endsWith('.ts'))

  for (const file of collectionFiles) {
    const filePath = path.join(collectionsDir, file.name)
    collections.push({
      name: file.name.replace('.ts', ''),
      path: filePath,
      content: readFile(filePath),
    })
  }

  // Also check subdirectories
  const subDirs = fs.readdirSync(collectionsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())

  for (const subDir of subDirs) {
    const indexPath = path.join(collectionsDir, subDir.name, 'index.ts')
    if (fs.existsSync(indexPath)) {
      collections.push({
        name: subDir.name,
        path: indexPath,
        content: readFile(indexPath),
      })
    }
  }

  return collections
}

// Generate the AI prompt file
function generateAIPromptFile() {
  console.log('🔍 Scanning codebase for AI prompt generation...')

  const blocks = getBlockConfigs()
  const collections = getCollectionConfigs()
  
  // Read example files
  const sampleSeedData = readFile(path.join(rootDir, 'sample-payload-seed-data.json'))
  const sampleAPIResponse = readFile(path.join(rootDir, 'sample-payload-api-response.json'))
  const faqBlockReference = readFile(path.join(rootDir, 'faq-block-structure-reference.json'))
  const payloadBlocksSchema = readFile(path.join(rootDir, 'payload-blocks.json'))

  // Read FAQ component to show how it's rendered
  const faqComponent = readFile(path.join(rootDir, 'src', 'blocks', 'FAQ', 'Component.tsx'))

  // Read default lexical config
  const defaultLexical = readFile(path.join(rootDir, 'src', 'fields', 'defaultLexical.ts'))

  // Read link and linkGroup fields (used in multiple blocks)
  const linkField = readFile(path.join(rootDir, 'src', 'fields', 'link.ts'))
  const linkGroupField = readFile(path.join(rootDir, 'src', 'fields', 'linkGroup.ts'))

  const timestamp = new Date().toISOString()

  const aiPromptContent = `# Payload CMS AI Generation Prompt File

**Generated:** ${timestamp}
**Purpose:** This file contains all necessary information for AI to generate Payload CMS compatible posts with blocks.

---

## 📋 INSTRUCTIONS FOR AI

You are tasked with generating Payload CMS post data that includes custom blocks (especially FAQ blocks).

### Your Task:
1. Generate a complete Payload CMS post structure in JSON format
2. Include FAQ blocks embedded in the richText content field
3. Use the exact structure shown in the examples below
4. Follow the block schemas exactly as defined

### Output Format:
- JSON format matching \`sample-payload-seed-data.json\` structure
- OR API response format matching \`sample-payload-api-response.json\` structure
- Both formats are acceptable, but seed data format is preferred for creation

### Key Requirements:
1. **FAQ Blocks**: Must be embedded in \`content.root.children\` as \`type: "block"\` nodes
2. **Block Type**: Must use \`blockType: "faq"\` exactly
3. **Lexical Format**: All richText fields must use Lexical editor format (see examples)
4. **Required Fields**: FAQ items must have \`question\` (text) and \`answer\` (Lexical format)
5. **Optional Fields**: FAQ block can have optional \`title\` field

---

## 🧩 BLOCK SCHEMAS

### FAQ Block Schema

\`\`\`typescript
${blocks.find(b => b.name === 'FAQ')?.content || '// FAQ block config not found'}
\`\`\`

### All Available Blocks

${blocks.map(block => `
#### ${block.name} Block
\`\`\`typescript
${block.content}
\`\`\`
`).join('\n')}

---

## 📚 COLLECTION SCHEMAS

### Posts Collection (Where FAQ blocks are used)

\`\`\`typescript
${collections.find(c => c.name === 'Posts' || c.name === 'posts')?.content || collections.find(c => c.path.includes('Posts'))?.content || '// Posts collection not found'}
\`\`\`

### All Collections

${collections.map(collection => `
#### ${collection.name} Collection
\`\`\`typescript
${collection.content}
\`\`\`
`).join('\n')}

---

## 🔧 FIELD UTILITIES

### Link Field (used in multiple blocks)

\`\`\`typescript
${linkField}
\`\`\`

### Link Group Field (used in multiple blocks)

\`\`\`typescript
${linkGroupField}
\`\`\`

### Default Lexical Editor Config

\`\`\`typescript
${defaultLexical}
\`\`\`

---

## 📝 EXAMPLE STRUCTURES

### Example 1: Seed Data Format (Preferred for Creation)

\`\`\`json
${sampleSeedData}
\`\`\`

### Example 2: API Response Format (What Payload Returns)

\`\`\`json
${sampleAPIResponse}
\`\`\`

### Example 3: FAQ Block Reference (Simplified)

\`\`\`json
${faqBlockReference}
\`\`\`

### Example 4: Complete Block Schema Reference

\`\`\`json
${payloadBlocksSchema.substring(0, 5000)}...
\`\`\`

---

## 🎨 FRONTEND COMPONENT (How FAQ Blocks Are Rendered)

\`\`\`tsx
${faqComponent}
\`\`\`

**Note:** This shows how FAQ blocks are rendered on the frontend. The component expects:
- \`title\` (optional): FAQ section title
- \`items\`: Array of FAQ items with \`question\` and \`answer\` (Lexical format)

---

## ✅ VALIDATION CHECKLIST

Before generating, ensure your output:

- [ ] Uses Lexical editor format for all richText fields
- [ ] Embeds FAQ blocks as \`type: "block"\` nodes in \`content.root.children\`
- [ ] Uses \`blockType: "faq"\` exactly (lowercase)
- [ ] Includes required fields: \`items\` array with at least one item
- [ ] Each FAQ item has \`question\` (text) and \`answer\` (Lexical format)
- [ ] Follows the structure from \`sample-payload-seed-data.json\`
- [ ] All text nodes have required properties: \`type\`, \`text\`, \`version\`, \`detail\`, \`format\`, \`mode\`, \`style\`
- [ ] All paragraph/heading nodes have: \`type\`, \`children\`, \`direction\`, \`format\`, \`indent\`, \`version\`

---

## 🚀 USAGE EXAMPLE

### Prompt to AI:
\`\`\`
Generate a Payload CMS blog post about "Getting Started with TypeScript" 
with 5 FAQ items. Use the structure from the examples provided.
\`\`\`

### Expected Output:
- A complete JSON object matching \`sample-payload-seed-data.json\` structure
- FAQ block embedded in the content with 5 items
- All richText fields in Lexical format
- Proper nesting and structure

---

## 📌 IMPORTANT NOTES

1. **Block Location**: FAQ blocks are embedded in the \`content\` field's Lexical editor state, NOT as separate fields
2. **Relationship IDs**: In seed data format, use IDs (numbers or strings). In API response format, relationships are populated objects
3. **Lexical Format**: Always use the full Lexical format with all required properties - don't simplify
4. **Block Type**: Must match the block slug exactly (e.g., "faq", "banner", "code", "mediaBlock")
5. **Version Numbers**: Include \`version: 1\` for text nodes, \`version: 2\` for block nodes

---

## 🔄 AUTO-UPDATE

This file is automatically generated. To regenerate:
\`\`\`bash
npx tsx scripts/generate-ai-prompt-file.ts
\`\`\`

Or add to package.json:
\`\`\`json
{
  "scripts": {
    "generate-ai-prompt": "tsx scripts/generate-ai-prompt-file.ts"
  }
}
\`\`\`

---

**Last Updated:** ${timestamp}
**Generated by:** generate-ai-prompt-file.ts
`

  // Write to file
  const outputPath = path.join(rootDir, 'AI_PROMPT_FILE.md')
  fs.writeFileSync(outputPath, aiPromptContent, 'utf-8')

  console.log('✅ AI prompt file generated successfully!')
  console.log(`📄 Output: ${outputPath}`)
  console.log(`📊 Included:`)
  console.log(`   - ${blocks.length} block schemas`)
  console.log(`   - ${collections.length} collection schemas`)
  console.log(`   - Example structures`)
  console.log(`   - Field utilities`)
  console.log(`   - Frontend components`)
  console.log(`\n💡 Use this file when prompting AI to generate Payload CMS posts!`)
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('generate-ai-prompt-file')) {
  try {
    generateAIPromptFile()
    console.log('✨ Script completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

export { generateAIPromptFile }

