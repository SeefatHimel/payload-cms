/**
 * AI Content Formatter using Google Gemini
 * Formats and enhances content for Payload CMS Lexical format
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

interface FormatOptions {
  improveStructure?: boolean
  enhanceReadability?: boolean
  fixFormatting?: boolean
  addSemanticTags?: boolean
}

/**
 * Format content using Google Gemini AI
 */
export async function formatContentWithAI(
  content: string,
  options: FormatOptions = {}
): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY

  if (!apiKey) {
    console.warn('[AI Formatter] ⚠️ GOOGLE_AI_API_KEY not set, skipping AI formatting')
    return content
  }

  try {
    const modelName = process.env.GOOGLE_AI_MODEL || 'gemini-2.0-flash-exp'
    console.log(`[AI Formatter] 🤖 Initializing Google Gemini AI (model: ${modelName})...`)
    
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: modelName })

    const prompt = buildFormattingPrompt(content, options)
    const contentLength = content.length

    console.log(`[AI Formatter] 📤 Sending ${contentLength} characters to Gemini for formatting...`)
    console.log(`[AI Formatter] 📋 Options:`, options)
    
    const startTime = Date.now()
    const result = await model.generateContent(prompt)
    const response = await result.response
    const formattedText = response.text()
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.log(`[AI Formatter] ✅ Successfully formatted content with Gemini!`)
    console.log(`[AI Formatter] ⏱️  Processing time: ${duration}s`)
    console.log(`[AI Formatter] 📊 Original length: ${contentLength} chars → Formatted length: ${formattedText.length} chars`)
    
    return formattedText
  } catch (error) {
    console.error('[AI Formatter] ❌ Error formatting content with Gemini:', error)
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
export async function enhanceContentQuality(
  content: string,
  _context?: string
): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY

  if (!apiKey) {
    console.warn('[AI Formatter] ⚠️ GOOGLE_AI_API_KEY not set, skipping AI enhancement')
    return content
  }

  try {
    const modelName = process.env.GOOGLE_AI_MODEL || 'gemini-2.0-flash-exp'
    console.log(`[AI Formatter] 🤖 Using Google Gemini AI (${modelName}) to enhance content for Payload CMS...`)
    
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: modelName })

    const payloadCMSPrompt = `You are a content enhancer for Payload CMS. Your task is to improve the TEXT CONTENT ONLY while preserving the original structure and formatting.

CRITICAL INSTRUCTIONS:
- DO NOT change the structure, spacing, or formatting
- DO NOT reorganize paragraphs or sections
- DO NOT convert lists to different formats
- DO NOT add or remove headings
- ONLY improve the clarity, grammar, and readability of the text itself
- PRESERVE all original bullet points, spacing, and design elements
- PRESERVE all original formatting (bold, italic, etc.)
- Keep the exact same paragraph breaks and structure

What you SHOULD do:
- Fix grammar and spelling errors
- Improve sentence clarity and flow
- Enhance readability without changing meaning
- Make minor wording improvements
- Keep the same tone and style

What you SHOULD NOT do:
- Change paragraph structure
- Reorganize content
- Add or remove headings
- Change list formatting
- Modify spacing or indentation
- Restructure tables (only improve text within them)

Content to enhance (preserve structure, improve text only):
${content}

Return the enhanced content with EXACTLY the same structure, spacing, and formatting:`

    console.log(`[AI Formatter] 📤 Sending ${content.length} characters to Gemini with Payload CMS instructions...`)
    const startTime = Date.now()
    
    const result = await model.generateContent(payloadCMSPrompt)
    const response = await result.response
    const enhancedText = response.text()
    
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    
    console.log(`[AI Formatter] ✅ Content enhanced for Payload CMS successfully!`)
    console.log(`[AI Formatter] ⏱️  Processing time: ${duration}s`)
    console.log(`[AI Formatter] 📊 Original: ${content.length} chars → Enhanced: ${enhancedText.length} chars`)
    
    return enhancedText
  } catch (error) {
    console.error('[AI Formatter] ❌ Error enhancing content with Gemini:', error)
    if (error instanceof Error) {
      console.error('[AI Formatter] Error message:', error.message)
    }
    return content
  }
}

