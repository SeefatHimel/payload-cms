/**
 * Multi-Provider AI Content Formatter
 * Supports: Google Gemini, OpenAI, and more
 */

export type AIProvider = 'google' | 'openai' | 'none'

interface AIProviderConfig {
  provider: AIProvider
  apiKey?: string
  model?: string
}

/**
 * Get the configured AI provider from environment variables
 */
export function getAIProvider(): AIProviderConfig {
  // Check OpenAI first (usually has better free tier)
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini', // Fast and cheap
    }
  }

  // Fall back to Google Gemini
  if (process.env.GOOGLE_AI_API_KEY) {
    return {
      provider: 'google',
      apiKey: process.env.GOOGLE_AI_API_KEY,
      model: process.env.GOOGLE_AI_MODEL || 'gemini-2.0-flash-exp',
    }
  }

  return {
    provider: 'none',
  }
}

/**
 * Format content using the configured AI provider
 */
export async function formatContentWithAI(
  content: string,
  prompt: string
): Promise<string> {
  const config = getAIProvider()

  if (config.provider === 'none' || !config.apiKey) {
    console.warn('[AI Provider] ⚠️ No AI provider configured, skipping formatting')
    return content
  }

  try {
    if (config.provider === 'openai') {
      return await formatWithOpenAI(content, prompt, config.apiKey, config.model)
    }

    if (config.provider === 'google') {
      return await formatWithGoogle(content, prompt, config.apiKey, config.model)
    }

    return content
  } catch (error) {
    console.error('[AI Provider] ❌ Error formatting content:', error)
    return content
  }
}

/**
 * Format content using OpenAI
 */
async function formatWithOpenAI(
  content: string,
  prompt: string,
  apiKey: string,
  model?: string
): Promise<string> {
  const { OpenAI } = await import('openai')
  const openai = new OpenAI({ apiKey })

  console.log(`[AI Provider] 🤖 Using OpenAI (${model || 'gpt-4o-mini'})...`)

  const response = await openai.chat.completions.create({
    model: model || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: content,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  })

  const formattedText = response.choices[0]?.message?.content || content

  console.log(`[AI Provider] ✅ Content formatted with OpenAI successfully!`)
  return formattedText
}

/**
 * Format content using Google Gemini
 */
async function formatWithGoogle(
  content: string,
  prompt: string,
  apiKey: string,
  model?: string
): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(apiKey)
  const aiModel = genAI.getGenerativeModel({ model: model || 'gemini-2.0-flash-exp' })

  console.log(`[AI Provider] 🤖 Using Google Gemini (${model || 'gemini-2.0-flash-exp'})...`)

  const fullPrompt = `${prompt}\n\nContent to format:\n${content}`

  const result = await aiModel.generateContent(fullPrompt)
  const response = await result.response
  const formattedText = response.text()

  console.log(`[AI Provider] ✅ Content formatted with Google Gemini successfully!`)
  return formattedText
}

/**
 * Batch format FAQs using the configured AI provider
 */
export async function batchFormatFAQsWithAI(
  faqData: Array<{
    blockIndex: number
    title?: string | null
    items: Array<{
      itemIndex: number
      question: string
      answer: string
    }>
  }>
): Promise<Array<{
  blockIndex: number
  title?: string | null
  items: Array<{
    itemIndex: number
    question: string
    answer: string
  }>
}>> {
  const config = getAIProvider()

  if (config.provider === 'none' || !config.apiKey) {
    console.warn('[AI Provider] ⚠️ No AI provider configured, skipping FAQ formatting')
    return faqData
  }

  try {
    if (config.provider === 'openai') {
      return await batchFormatFAQsWithOpenAI(faqData, config.apiKey, config.model)
    }

    if (config.provider === 'google') {
      return await batchFormatFAQsWithGoogle(faqData, config.apiKey, config.model)
    }

    return faqData
  } catch (error) {
    console.error('[AI Provider] ❌ Error batch formatting FAQs:', error)
    return faqData
  }
}

/**
 * Batch format FAQs with OpenAI
 */
async function batchFormatFAQsWithOpenAI(
  faqData: Array<{
    blockIndex: number
    title?: string | null
    items: Array<{
      itemIndex: number
      question: string
      answer: string
    }>
  }>,
  apiKey: string,
  model?: string
): Promise<Array<{
  blockIndex: number
  title?: string | null
  items: Array<{
    itemIndex: number
    question: string
    answer: string
  }>
}>> {
  const { OpenAI } = await import('openai')
  const openai = new OpenAI({ apiKey })

  console.log(`[AI Provider] 🤖 Batch formatting FAQs with OpenAI (${model || 'gpt-4o-mini'})...`)

  const prompt = `You are a content formatter for Payload CMS. Your task is to format and improve FAQ content while preserving meaning and structure.

CRITICAL INSTRUCTIONS:
- Improve clarity, grammar, and readability of questions and answers
- Keep questions concise and clear
- Preserve the original meaning and tone
- Do NOT change the structure or format
- Return ONLY valid JSON, no markdown, no code blocks

Input FAQ data:
${JSON.stringify(faqData, null, 2)}

Return a JSON array with the same structure, where each FAQ block has:
- blockIndex: same as input
- title: formatted title (or null if not provided)
- items: array of { itemIndex: number, question: string, answer: string }

Return ONLY the JSON array, nothing else:`

  const response = await openai.chat.completions.create({
    model: model || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a JSON formatter. Always return valid JSON array only, no markdown, no code blocks.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
  })

  const responseText = response.choices[0]?.message?.content || '[]'
  let jsonData: any

  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseText.trim()
    if (jsonText.startsWith('```')) {
      const lines = jsonText.split('\n')
      const startIndex = lines.findIndex((line: string) => line.includes('json') || line.includes('['))
      let endIndex = -1
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes('```')) {
          endIndex = i
          break
        }
      }
      if (startIndex >= 0 && endIndex > startIndex) {
        jsonText = lines.slice(startIndex + 1, endIndex).join('\n')
      }
    }
    jsonText = jsonText.trim()

    // Parse JSON
    const parsed = JSON.parse(jsonText)
    // If it's wrapped in a key, extract the array
    jsonData = parsed.faqs || parsed.data || parsed
    if (!Array.isArray(jsonData)) {
      jsonData = [jsonData]
    }
  } catch (error) {
    console.error('[AI Provider] ❌ Failed to parse OpenAI JSON response:', error)
    console.error('[AI Provider] Response text:', responseText.substring(0, 500))
    return faqData
  }

  console.log(`[AI Provider] ✅ Batch FAQ formatting completed with OpenAI!`)
  return jsonData
}

/**
 * Batch format FAQs with Google Gemini
 */
async function batchFormatFAQsWithGoogle(
  faqData: Array<{
    blockIndex: number
    title?: string | null
    items: Array<{
      itemIndex: number
      question: string
      answer: string
    }>
  }>,
  apiKey: string,
  model?: string
): Promise<Array<{
  blockIndex: number
  title?: string | null
  items: Array<{
    itemIndex: number
    question: string
    answer: string
  }>
}>> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(apiKey)
  const aiModel = genAI.getGenerativeModel({ model: model || 'gemini-2.0-flash-exp' })

  console.log(`[AI Provider] 🤖 Batch formatting FAQs with Google Gemini (${model || 'gemini-2.0-flash-exp'})...`)

  const prompt = `You are a content formatter for Payload CMS. Your task is to format and improve FAQ content while preserving meaning and structure.

CRITICAL INSTRUCTIONS:
- Improve clarity, grammar, and readability of questions and answers
- Keep questions concise and clear
- Preserve the original meaning and tone
- Do NOT change the structure or format
- Return ONLY valid JSON, no markdown, no code blocks

Input FAQ data:
${JSON.stringify(faqData, null, 2)}

Return a JSON array with the same structure, where each FAQ block has:
- blockIndex: same as input
- title: formatted title (or null if not provided)
- items: array of { itemIndex: number, question: string, answer: string }

Return ONLY the JSON array, nothing else:`

  const result = await aiModel.generateContent(prompt)
  const response = await result.response
  const responseText = response.text()

  // Extract JSON from response
  let jsonText = responseText.trim()
  if (jsonText.startsWith('```')) {
    const lines = jsonText.split('\n')
    const startIndex = lines.findIndex((line: string) => line.includes('json') || line.includes('['))
    let endIndex = -1
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].includes('```')) {
        endIndex = i
        break
      }
    }
    if (startIndex >= 0 && endIndex > startIndex) {
      jsonText = lines.slice(startIndex + 1, endIndex).join('\n')
    }
  }
  jsonText = jsonText.trim()

  let jsonData: any
  try {
    jsonData = JSON.parse(jsonText)
    if (!Array.isArray(jsonData)) {
      jsonData = [jsonData]
    }
  } catch (error) {
    console.error('[AI Provider] ❌ Failed to parse Google JSON response:', error)
    return faqData
  }

  console.log(`[AI Provider] ✅ Batch FAQ formatting completed with Google Gemini!`)
  return jsonData
}

