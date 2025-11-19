/**
 * Multi-Provider AI Content Formatter
 * Supports: OpenRouter API
 */

export type AIProvider = 'openrouter' | 'none'

interface AIProviderConfig {
  provider: AIProvider
  apiKey?: string
  model?: string
}

/**
 * Get the configured AI provider from environment variables
 */
export function getAIProvider(): AIProviderConfig {
  // Use OpenRouter API
  if (process.env.OPENROUTER_API_KEY) {
    return {
      provider: 'openrouter',
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini', // Default model via OpenRouter
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
  prompt: string,
  onRequestResponse?: (request: any, response: any) => void
): Promise<string> {
  const config = getAIProvider()

  if (config.provider === 'none' || !config.apiKey) {
    console.warn('[AI Provider] ⚠️ No AI provider configured, skipping formatting')
    return content
  }

  try {
    if (config.provider === 'openrouter') {
      return await formatWithOpenRouter(content, prompt, config.apiKey, config.model, onRequestResponse)
    }

    return content
  } catch (error) {
    console.error('[AI Provider] ❌ Error formatting content:', error)
    return content
  }
}

/**
 * Format content using OpenRouter API
 */
async function formatWithOpenRouter(
  content: string,
  prompt: string,
  apiKey: string,
  model?: string,
  onRequestResponse?: (request: any, response: any) => void
): Promise<string> {
  console.log(`[AI Provider] 🤖 Using OpenRouter (${model || 'openai/gpt-4o-mini'})...`)

  const requestBody = {
    model: model || 'openai/gpt-4o-mini',
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
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
      'X-Title': 'Payload CMS Content Formatter',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter API error: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  const formattedText = data.choices?.[0]?.message?.content || content

  // Call callback if provided to save request/response
  if (onRequestResponse) {
    onRequestResponse(requestBody, data)
  }

  console.log(`[AI Provider] ✅ Content formatted with OpenRouter successfully!`)
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
  }>,
  onRequestResponse?: (request: any, response: any) => void
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
    if (config.provider === 'openrouter') {
      return await batchFormatFAQsWithOpenRouter(faqData, config.apiKey, config.model, onRequestResponse)
    }

    return faqData
  } catch (error) {
    console.error('[AI Provider] ❌ Error batch formatting FAQs:', error)
    return faqData
  }
}

/**
 * Batch format FAQs with OpenRouter API
 */
async function batchFormatFAQsWithOpenRouter(
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
  model?: string,
  onRequestResponse?: (request: any, response: any) => void
): Promise<Array<{
  blockIndex: number
  title?: string | null
  items: Array<{
    itemIndex: number
    question: string
    answer: string
  }>
}>> {
  console.log(`[AI Provider] 🤖 Batch formatting FAQs with OpenRouter (${model || 'openai/gpt-4o-mini'})...`)

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

  const requestBody = {
    model: model || 'openai/gpt-4o-mini',
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
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
      'X-Title': 'Payload CMS FAQ Formatter',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[AI Provider] ❌ OpenRouter API error:', response.status, errorText)
    return faqData
  }

  const data = await response.json()
  const responseText = data.choices?.[0]?.message?.content || '[]'
  
  // Call callback if provided to save request/response
  if (onRequestResponse) {
    onRequestResponse({ ...requestBody, prompt }, data)
  }

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
    console.error('[AI Provider] ❌ Failed to parse OpenRouter JSON response:', error)
    console.error('[AI Provider] Response text:', responseText.substring(0, 500))
    return faqData
  }

  console.log(`[AI Provider] ✅ Batch FAQ formatting completed with OpenRouter!`)
  return jsonData
}

