/**
 * AI Content Formatter - Multi-Provider Support
 * Supports: OpenRouter API
 * Formats and enhances content for Payload CMS Lexical format
 */

import { formatContentWithAI as formatWithProvider, batchFormatFAQsWithAI } from './aiProvider'

interface FormatOptions {
  improveStructure?: boolean
  enhanceReadability?: boolean
  fixFormatting?: boolean
  addSemanticTags?: boolean
}

/**
 * Format content using OpenRouter AI
 */
export async function formatContentWithAI(
  content: string,
  options: FormatOptions = {}
): Promise<string> {
  const { getAIProvider } = await import('./aiProvider')
  const config = getAIProvider()

  if (!config.apiKey || config.provider === 'none') {
    console.warn('[AI Formatter] ⚠️ OPENROUTER_API_KEY not set, skipping AI formatting')
    return content
  }

  try {
    const prompt = buildFormattingPrompt(content, options)
    const contentLength = content.length

    console.log(`[AI Formatter] 📤 Sending ${contentLength} characters to OpenRouter for formatting...`)
    console.log(`[AI Formatter] 📋 Options:`, options)
    
    const startTime = Date.now()
    const formattedText = await formatWithProvider(content, prompt)
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.log(`[AI Formatter] ✅ Successfully formatted content with OpenRouter!`)
    console.log(`[AI Formatter] ⏱️  Processing time: ${duration}s`)
    console.log(`[AI Formatter] 📊 Original length: ${contentLength} chars → Formatted length: ${formattedText.length} chars`)
    
    return formattedText
  } catch (error) {
    console.error('[AI Formatter] ❌ Error formatting content with OpenRouter:', error)
    if (error instanceof Error) {
      console.error('[AI Formatter] Error details:', error.message)
    }
    // Return original content if AI formatting fails
    return content
  }
}

/**
 * Build the formatting prompt based on options
 */
function buildFormattingPrompt(content: string, options: FormatOptions): string {
  const tasks: string[] = []

  if (options.improveStructure) {
    tasks.push('- Improve the overall structure and organization')
  }

  if (options.enhanceReadability) {
    tasks.push('- Enhance readability and flow')
  }

  if (options.fixFormatting) {
    tasks.push('- Fix any formatting inconsistencies')
  }

  if (options.addSemanticTags) {
    tasks.push('- Add semantic HTML-like structure where appropriate')
  }

  const taskList = tasks.length > 0 
    ? tasks.join('\n')
    : '- Format the content for better presentation'

  return `You are a content formatter for a CMS system. Your task is to format and improve the following content while preserving its meaning and key information.

Tasks:
${taskList}

Guidelines:
- Preserve all important information
- Maintain the original tone and style
- Use proper paragraph breaks
- Format lists with bullet points or numbers where appropriate
- Use headings (H1, H2, H3) for sections when it makes sense
- Keep the content concise but complete
- Do not add information that wasn't in the original

Content to format:
${content}

Please return the formatted content:`
}

/**
 * Format Lexical content structure using AI
 * This can help improve the structure of already-parsed Lexical content
 */
export async function enhanceLexicalContent(
  lexicalJson: any,
  options: FormatOptions = {}
): Promise<any> {
  // Convert Lexical JSON to readable text first
  const textContent = extractTextFromLexical(lexicalJson)
  
  // Format with AI
  const formattedText = await formatContentWithAI(textContent, options)
  
  // Note: This returns formatted text, not Lexical JSON
  // For full Lexical enhancement, we'd need a more sophisticated approach
  return formattedText
}

/**
 * Extract plain text from Lexical JSON structure
 */
function extractTextFromLexical(lexical: any): string {
  if (!lexical?.root?.children) {
    return ''
  }

  const extractText = (node: any): string => {
    if (node.type === 'text' && node.text) {
      return node.text
    }

    if (node.children && Array.isArray(node.children)) {
      return node.children.map(extractText).join('')
    }

    return ''
  }

  const paragraphs: string[] = []
  
  for (const child of lexical.root.children) {
    const text = extractText(child)
    if (text.trim()) {
      paragraphs.push(text.trim())
    }
  }

  return paragraphs.join('\n\n')
}

/**
 * Simple AI enhancement for content quality
 */
// Global flag to track if quota is exhausted (resets on server restart)
let quotaExhausted = false
let quotaExhaustedUntil: number | null = null

/**
 * Check if quota is currently exhausted
 */
export function isQuotaExhausted(): boolean {
  if (!quotaExhausted) return false
  if (!quotaExhaustedUntil) return false
  // Check if quota reset time has passed
  if (Date.now() >= quotaExhaustedUntil) {
    quotaExhausted = false
    quotaExhaustedUntil = null
    return false
  }
  return true
}

/**
 * Get time until quota resets (in minutes)
 */
export function getQuotaResetTime(): number | null {
  if (!quotaExhaustedUntil) return null
  const minutes = Math.ceil((quotaExhaustedUntil - Date.now()) / 60000)
  return minutes > 0 ? minutes : null
}

/**
 * FAQ item structure for batch formatting
 */
export interface FAQItemForFormatting {
  question: string
  answer: string // Plain text extracted from Lexical
}

export interface FAQBlockForFormatting {
  title?: string
  items: FAQItemForFormatting[]
}

export interface FormattedFAQBlock {
  title?: string
  items: Array<{
    question: string
    answer: string // Formatted answer as plain text (will be converted to Lexical)
  }>
}

/**
 * Batch format all FAQ blocks in a single API call
 * This reduces API calls from 12+ to just 1 call per import
 */
export async function batchFormatFAQs(
  faqBlocks: FAQBlockForFormatting[]
): Promise<FormattedFAQBlock[]> {
  // Prepare input data for AI
  const inputData = faqBlocks.map((block, blockIndex) => ({
    blockIndex,
    title: block.title || null,
    items: block.items.map((item, itemIndex) => ({
      itemIndex,
      question: item.question,
      answer: item.answer,
    })),
  }))

  const totalItems = faqBlocks.reduce((sum, block) => sum + block.items.length, 0)
  console.log(`[AI Formatter] 📤 Batch formatting ${totalItems} FAQ items in a single API call...`)

  const startTime = Date.now()

  try {
    // Use OpenRouter API
    const formattedBlocks = await batchFormatFAQsWithAI(inputData)

    // Map formatted blocks back to original order
    const resultBlocks: FormattedFAQBlock[] = faqBlocks.map((originalBlock, blockIndex) => {
      const formattedBlock = formattedBlocks.find(b => b.blockIndex === blockIndex)

      if (!formattedBlock) {
        console.warn(`[AI Formatter] ⚠️ No formatted block found for index ${blockIndex}, using original`)
        return {
          title: originalBlock.title,
          items: originalBlock.items.map(item => ({ question: item.question, answer: item.answer })),
        }
      }

      return {
        title: formattedBlock.title || originalBlock.title,
        items: originalBlock.items.map((originalItem, itemIndex) => {
          const formattedItem = formattedBlock.items.find(i => i.itemIndex === itemIndex)
          return {
            question: formattedItem?.question || originalItem.question,
            answer: formattedItem?.answer || originalItem.answer,
          }
        }),
      }
    })

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.log(`[AI Formatter] ✅ Batch FAQ formatting completed successfully!`)
    console.log(`[AI Formatter] ⏱️  Processing time: ${duration}s`)
    console.log(`[AI Formatter] 📊 Formatted ${totalItems} FAQ items in 1 API call (reduced from ${totalItems * 2 + faqBlocks.length} calls)`)

    return resultBlocks
  } catch (error) {
    console.error('[AI Formatter] ❌ Error batch formatting FAQs:', error)
    if (error instanceof Error) {
      console.error('[AI Formatter] Error message:', error.message)
    }
    // Return original content on error
    return faqBlocks.map(block => ({
      title: block.title,
      items: block.items.map(item => ({ question: item.question, answer: item.answer })),
    }))
  }
}

export async function enhanceContentQuality(
  content: string,
  _context?: string,
  onRequestResponse?: (request: any, response: any) => void
): Promise<string> {
  const payloadCMSPrompt = `You are a content formatter for Payload CMS. Your task is to preserve content EXACTLY but format it for automatic block detection when block markers are present.

CRITICAL CONTENT PRESERVATION:
- DO NOT change ANY text, words, or content meaning
- DO NOT improve, enhance, or modify the actual text
- DO NOT fix grammar, spelling, or clarity
- DO NOT change wording, phrasing, or sentence structure
- DO NOT remove or skip any sections, especially FAQ sections
- PRESERVE all original text exactly as written
- MUST include ALL content from the input, including FAQ sections

BLOCK MARKERS & FORMATTING:
The content may contain special block markers that indicate Payload CMS blocks. When you see these markers, format the content structure (not the text) to make it parseable:

1. \`##FAQ\` - FAQ Block Marker (CRITICAL - DO NOT REMOVE FAQ SECTIONS)
   When you see \`##FAQ\` or \`##FAQ...\` (with additional text), you MUST:
   - KEEP the entire FAQ section in your response
   - Format questions on separate lines (as headings or paragraphs ending with "?")
   - Format answers on separate lines immediately following each question
   - If questions and answers are on the same line, split them into separate lines
   - Preserve all original text exactly
   
   EXAMPLE INPUT:
   \`\`\`
   ##FAQFrequently Asked Questions
   
   What platforms is Terra Nova available on? Terra Nova is available on Windows and Mac.
   
   Can I play multiplayer? Yes, multiplayer mode allows you to form alliances.
   \`\`\`
   
   EXAMPLE OUTPUT (format structure, preserve text):
   \`\`\`
   ##FAQ
   
   Frequently Asked Questions
   
   What platforms is Terra Nova available on?
   Terra Nova is available on Windows and Mac.
   
   Can I play multiplayer?
   Yes, multiplayer mode allows you to form alliances.
   \`\`\`

2. \`##BANNER\` - Banner Block Marker
   When you see \`##BANNER\` or \`##BANNER...\` (with additional text), you MUST:
   - Preserve the text exactly
   - Keep it as a single block of content
   - Preserve all original text exactly

3. \`##CODE\` - Code Block Marker
   When you see \`##CODE\` or \`##CODE...\` (with additional text), you MUST:
   - Preserve all code exactly as written
   - Keep code formatting intact
   - Preserve all original text exactly

4. \`##MEDIABLOCK\` - MediaBlock Block Marker
   When you see \`##MEDIABLOCK\` or \`##MEDIABLOCK...\` (with additional text), you MUST:
   - Preserve captions and descriptions exactly
   - Preserve all original text exactly

5. \`##CTA\` - Call to Action Block Marker
   When you see \`##CTA\` or \`##CTA...\` (with additional text), you MUST:
   - Preserve the content exactly
   - Format structure for automatic block detection
   - Preserve all original text exactly

6. \`##CONTENT\` - Content Block Marker
   When you see \`##CONTENT\` or \`##CONTENT...\` (with additional text), you MUST:
   - Preserve the content exactly
   - Format structure for automatic block detection
   - Preserve all original text exactly

PAYLOAD CMS BLOCK STRUCTURES:

FAQBlock Block Structure:
- blockType: "faq"
- title: text (optional)
- items: Array of {
  question: text
  answer: richText (Lexical format)
}

BannerBlock Block Structure:
- blockType: "banner"
- style: "info" | "warning" | "error" | "success"
- content: richText (Lexical format)

CodeBlock Block Structure:
- blockType: "code"
- language: "typescript" | "javascript" | "css"
- code: code (required)

MediaBlock Block Structure:
- blockType: "mediaBlock"
- media: upload (required)

CallToActionBlock Block Structure:
- blockType: "cta"
- richText: richText (Lexical format)
- links: Array of {
  link: group
}

ContentBlock Block Structure:
- blockType: "content"
- columns: Array of {
  size: select
  richText: richText (Lexical format)
  enableLink: checkbox
  link: group
}

YOUR TASK:
1. Preserve ALL text content exactly as provided - DO NOT REMOVE ANY SECTIONS
2. When you see block markers (##FAQ, ##BANNER, etc.), format the STRUCTURE (line breaks, organization) to make it parseable
3. Do NOT change any actual text content
4. Keep block markers exactly as written
5. Format content after markers in a way that can be automatically converted to Payload CMS blocks
6. CRITICAL: If you see ##FAQ or FAQ sections, you MUST include them in your response - DO NOT SKIP THEM

VALIDATION CHECKLIST BEFORE RETURNING:
- Did I include ALL FAQ questions and answers from the input?
- Did I preserve ALL text exactly as written?
- Did I format the structure (line breaks) for block detection?
- Did I keep all block markers (##FAQ, ##BANNER, etc.)?

Return the content with preserved text but formatted structure for block detection.`

  console.log(`[AI Formatter] 📤 Sending ${content.length} characters for formatting (preserving text, structuring for blocks)...`)
  const startTime = Date.now()

  try {
    // Use OpenRouter API
    const preservedText = await formatWithProvider(content, payloadCMSPrompt, onRequestResponse)

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.log(`[AI Formatter] ✅ Content preserved for Payload CMS successfully!`)
    console.log(`[AI Formatter] ⏱️  Processing time: ${duration}s`)
    console.log(`[AI Formatter] 📊 Original: ${content.length} chars → Preserved: ${preservedText.length} chars`)

    return preservedText
  } catch (error) {
    console.error('[AI Formatter] ❌ Error preserving content:', error)
    if (error instanceof Error) {
      console.error('[AI Formatter] Error message:', error.message)
    }
    // Return original content on error
    return content
  }
}

