import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { createLocalReq } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { getAccessToken } from '@/utilities/googleOAuth'
import { parseGoogleDocToLexical } from '@/utilities/googleDocsParser'
import { extractImagesFromExportedDoc } from '@/utilities/googleDocsImageHandler'
import { extractGoogleDocId, isValidGoogleDocId } from '@/utilities/extractGoogleDocId'
import { enhanceContentQuality, batchFormatFAQs, type FAQBlockForFormatting } from '@/utilities/aiFormatter'
import { parseMarkdownToLexical } from '@/utilities/markdownToLexical'
import { parseFAQsFromLexical } from '@/utilities/faqParser'
import { google } from 'googleapis'
import type { docs_v1 } from 'googleapis'
import type { Post } from '@/payload-types'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export const maxDuration = 300 // 5 minutes for large documents

/**
 * Helper function to save files in organized folders by doc ID and name
 */
async function saveToDocFolder(
  docId: string,
  docTitle: string,
  filename: string,
  content: string | object,
  subfolder?: string
): Promise<string | null> {
  try {
    const baseDir = join(process.cwd(), 'debug', 'google-docs')
    const safeTitle = (docTitle || 'untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const folderName = `${docId}-${safeTitle}`
    const folderPath = subfolder ? join(baseDir, folderName, subfolder) : join(baseDir, folderName)

    await mkdir(folderPath, { recursive: true })

    const filePath = join(folderPath, filename)
    const contentToWrite = typeof content === 'string' ? content : JSON.stringify(content, null, 2)

    await writeFile(filePath, contentToWrite, 'utf-8')
    console.log(`[Import] 💾 Saved to: ${filePath}`)
    return filePath
  } catch (error) {
    console.warn(`[Import] ⚠️  Failed to save file ${filename}:`, error)
    return null
  }
}

/**
 * Enhance text content in Lexical nodes while preserving structure
 * Maps enhanced text back to original nodes by matching content
 */
function enhanceTextInLexicalNodes(
  originalLexical: any,
  originalText: string,
  enhancedText: string
): any {
  // Split both texts into lines/paragraphs for mapping
  const originalLines = originalText.split('\n').filter(line => line.trim())
  const enhancedLines = enhancedText.split('\n').filter(line => line.trim())

  // If line counts don't match, return original (structure changed)
  if (originalLines.length !== enhancedLines.length) {
    console.warn(`[Import] ⚠️ Line count mismatch - preserving original structure`)
    return originalLexical
  }

  // Create a mapping of original to enhanced text (by position)
  const textMap = new Map<string, string>()
  for (let i = 0; i < originalLines.length; i++) {
    const original = originalLines[i].trim()
    const enhanced = enhancedLines[i].trim()
    if (original && enhanced && original !== enhanced) {
      textMap.set(original, enhanced)
    }
  }

  // If no changes detected, return original
  if (textMap.size === 0) {
    console.log(`[Import] ℹ️  No text changes detected - using original content`)
    return originalLexical
  }

  // Recursively update text nodes in Lexical structure
  function updateTextNodes(node: any): any {
    if (node.type === 'text' && node.text) {
      const nodeText = node.text
      let updatedText = nodeText

      // Try to find and replace matching text segments
      for (const [original, enhanced] of textMap.entries()) {
        // Only replace if the text segment appears in this node
        if (nodeText.includes(original)) {
          updatedText = nodeText.replace(original, enhanced)
          break // Only replace first match to avoid over-replacement
        }
      }

      // Only update if text actually changed
      if (updatedText !== nodeText) {
        return {
          ...node,
          text: updatedText
        }
      }
      return node
    }

    if (node.children && Array.isArray(node.children)) {
      return {
        ...node,
        children: node.children.map(updateTextNodes)
      }
    }

    return node
  }

  return {
    root: {
      ...originalLexical.root,
      children: originalLexical.root.children.map(updateTextNodes)
    }
  }
}

/**
 * Extract plain text from Lexical JSON structure for AI processing
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  // Authenticate user
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please log in to import documents.' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { docId: inputDocId, useAI = false } = body

    // Log AI configuration status
    const { getAIProvider } = await import('@/utilities/aiProvider')
    const aiConfig = getAIProvider()
    const hasApiKey = !!aiConfig.apiKey

    console.log(`[Import] 🔧 AI Configuration:`)
    console.log(`[Import]    - useAI requested: ${useAI}`)
    console.log(`[Import]    - Provider: ${aiConfig.provider === 'openrouter' ? 'OpenRouter' : 'None'}`)
    if (hasApiKey) {
      console.log(`[Import]    - Model: ${aiConfig.model || 'default'}`)
    }

    if (useAI && !hasApiKey) {
      console.warn(`[Import] ⚠️  AI formatting requested but no API key configured`)
    } else if (useAI && hasApiKey) {
      console.log(`[Import] ℹ️  AI formatting enabled. If quota is exhausted, import will continue without AI.`)
    }

    if (!inputDocId || typeof inputDocId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request. docId or URL is required.' },
        { status: 400 }
      )
    }

    // Extract Doc ID from URL or use as-is
    let docId = extractGoogleDocId(inputDocId.trim())

    if (!docId) {
      return NextResponse.json(
        { error: 'Invalid Google Doc URL or ID format.' },
        { status: 400 }
      )
    }

    if (!isValidGoogleDocId(docId)) {
      return NextResponse.json(
        { error: 'The provided Google Doc ID appears to be invalid.' },
        { status: 400 }
      )
    }

    // Get access token and setup OAuth client
    const { getOAuth2Client } = await import('@/utilities/googleOAuth')
    const oauth2Client = getOAuth2Client()
    const accessToken = await getAccessToken()

    // Set the access token on the OAuth client
    oauth2Client.setCredentials({
      access_token: accessToken,
    })

    // Initialize Google APIs with the OAuth client
    const docs = google.docs({
      version: 'v1',
      auth: oauth2Client
    })
    const drive = google.drive({
      version: 'v3',
      auth: oauth2Client
    })

    // Fetch Google Doc with timeout handling and fallback to Drive API export
    console.log(`[Import] Fetching Google Doc: ${docId}`)
    let doc: docs_v1.Schema$Document | null = null
    let title = 'Untitled Document'
    let lexicalContent: any

    try {
      const docResponse = await docs.documents.get({
        documentId: docId,
      })
      doc = docResponse.data
      title = doc?.title || 'Untitled Document'

      // Save Google Doc response to organized folder
      await saveToDocFolder(docId, title, 'google-doc-response.json', docResponse.data)
      await saveToDocFolder(docId, title, 'document-data.json', doc)

      // Parse document to Lexical format
      console.log(`[Import] Parsing document to Lexical format`)
      lexicalContent = parseGoogleDocToLexical(doc)
      console.log(`[Import] Parsed ${lexicalContent.root.children.length} content blocks`)

      // Save parsed Lexical content
      await saveToDocFolder(docId, title, 'parsed-lexical.json', lexicalContent)

      // Also save a plain text version for easy reading
      const textContent = extractTextFromLexical(lexicalContent)
      await saveToDocFolder(docId, title, 'extracted-text.txt', textContent)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.warn(`[Import] Documents API failed: ${errorMessage}`)

      // Check if this is the "not supported" error
      // This often happens with documents containing images or special formatting
      // We'll use Drive API export as a fallback to get the content
      if (errorMessage.includes('not supported') || errorMessage.includes('This operation is not supported')) {
        console.log(`[Import] Document not supported by Documents API, checking file type...`)

        try {
          // Get document metadata to check file type
          let fileMetadata
          let mimeType: string | null = null

          try {
            fileMetadata = await drive.files.get({
              fileId: docId,
              fields: 'name, mimeType',
            })
            title = fileMetadata.data.name || 'Untitled Document'
            mimeType = fileMetadata.data.mimeType || null
            console.log(`[Import] File type: ${mimeType}, Title: ${title}`)
          } catch (metadataError) {
            console.warn(`[Import] Could not get document metadata: ${metadataError instanceof Error ? metadataError.message : 'Unknown error'}`)
            // Continue without metadata - will try export as fallback
          }

          // Check if it's a Word document or other non-Google Docs file
          if (mimeType && !mimeType.includes('google-apps.document')) {
            // This is a Word document (.docx) or other file type, not a native Google Doc
            // We need to convert it to Google Docs format first
            console.log(`[Import] File is not a native Google Doc (${mimeType}), converting to Google Docs format...`)

            try {
              // Copy the file and convert it to Google Docs format
              const convertedFile = await drive.files.copy({
                fileId: docId,
                requestBody: {
                  name: `${title} (converted)`,
                  mimeType: 'application/vnd.google-apps.document',
                },
              })

              const convertedDocId = convertedFile.data.id
              if (!convertedDocId) {
                throw new Error('Failed to get converted document ID')
              }

              console.log(`[Import] Successfully converted to Google Doc: ${convertedDocId}`)

              // Now try to fetch the converted document using Documents API
              const convertedDocResponse = await docs.documents.get({
                documentId: convertedDocId,
              })
              doc = convertedDocResponse.data
              title = doc?.title || title

              // Save raw API response to file if enabled
              if (process.env.SAVE_GOOGLE_DOCS_RESPONSE === 'true') {
                try {
                  const debugDir = join(process.cwd(), 'debug')
                  await mkdir(debugDir, { recursive: true })

                  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
                  const safeTitle = (title || 'untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase()
                  const filename = `google-doc-converted-${safeTitle}-${convertedDocId.substring(0, 8)}-${timestamp}`

                  const rawResponsePath = join(debugDir, `${filename}-raw-api-response.json`)
                  await writeFile(rawResponsePath, JSON.stringify(convertedDocResponse.data, null, 2), 'utf-8')
                  console.log(`[Import] 💾 Saved converted document API response to: ${rawResponsePath}`)
                } catch (saveError) {
                  console.warn(`[Import] ⚠️  Failed to save debug files:`, saveError)
                }
              }

              // Parse document to Lexical format
              console.log(`[Import] Parsing converted document to Lexical format`)
              lexicalContent = parseGoogleDocToLexical(doc)
              console.log(`[Import] Parsed ${lexicalContent.root.children.length} content blocks`)

              // Save parsed Lexical content if enabled
              if (process.env.SAVE_GOOGLE_DOCS_RESPONSE === 'true') {
                try {
                  const debugDir = join(process.cwd(), 'debug')
                  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
                  const safeTitle = (title || 'untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase()
                  const filename = `google-doc-converted-${safeTitle}-${convertedDocId.substring(0, 8)}-${timestamp}`

                  const lexicalPath = join(debugDir, `${filename}-parsed-lexical.json`)
                  await writeFile(lexicalPath, JSON.stringify(lexicalContent, null, 2), 'utf-8')
                  console.log(`[Import] 💾 Saved parsed Lexical content to: ${lexicalPath}`)

                  const textContent = extractTextFromLexical(lexicalContent)
                  const textPath = join(debugDir, `${filename}-extracted-text.txt`)
                  await writeFile(textPath, textContent, 'utf-8')
                  console.log(`[Import] 💾 Saved extracted text to: ${textPath}`)
                } catch (saveError) {
                  console.warn(`[Import] ⚠️  Failed to save Lexical debug files:`, saveError)
                }
              }

              // Update docId to use the converted document for image extraction
              docId = convertedDocId

            } catch (convertError) {
              console.error('[Import] Failed to convert document:', convertError)
              const convertErrorMessage = convertError instanceof Error ? convertError.message : String(convertError)

              // Check if it's an authentication scope issue
              if (convertErrorMessage.includes('insufficient authentication scopes') || convertErrorMessage.includes('403')) {
                return NextResponse.json(
                  {
                    error: 'Insufficient permissions to convert Word documents',
                    details: 'Your current refresh token was issued with read-only permissions. Even though you\'ve updated the OAuth scopes in Google Cloud Console, you need to re-authenticate to get a new token with write permissions.',
                    solution: [
                      '1. Revoke existing access (optional but recommended):',
                      '   Visit https://myaccount.google.com/permissions and remove access to your app',
                      '2. Re-authenticate with new scopes:',
                      '   Visit /api/google-oauth/login in your browser',
                      '3. Grant the new permissions (including drive.file scope)',
                      '4. Copy the new refresh token from your console/terminal',
                      '5. Update GOOGLE_REFRESH_TOKEN in your .env file',
                      '6. Restart your server and try importing again',
                      '',
                      'Alternatively, manually convert the Word document to Google Docs format in Google Drive first.'
                    ].join('\n'),
                    originalError: errorMessage,
                  },
                  { status: 403 }
                )
              }

              return NextResponse.json(
                {
                  error: 'Failed to process document',
                  details: 'The file appears to be a Word document (.docx) that could not be converted to Google Docs format. Please convert it to Google Docs format manually first.',
                  originalError: errorMessage,
                },
                { status: 400 }
              )
            }
          } else {
            // It's a native Google Doc (or we couldn't determine type), try export
            console.log(`[Import] Native Google Doc detected (or type unknown), trying Drive API export fallback...`)

            // Export document as HTML to preserve structure
            // Note: Images will be extracted separately later using extractImagesFromExportedDoc
            // which also uses Drive API export, so this is a bit redundant but necessary
            const exportResponse = await drive.files.export(
              {
                fileId: docId,
                mimeType: 'text/html',
              },
              {
                responseType: 'text',
              }
            )

            const htmlContent = exportResponse.data as string

            if (!htmlContent || htmlContent.trim().length === 0) {
              return NextResponse.json(
                { error: 'Document appears to be empty or could not be exported' },
                { status: 400 }
              )
            }

            // Convert HTML to plain text for Lexical parsing
            // Remove HTML tags but preserve structure with newlines
            const textContent = htmlContent
              .replace(/<h[1-6][^>]*>/gi, '\n\n# ') // Headings
              .replace(/<\/h[1-6]>/gi, '\n')
              .replace(/<p[^>]*>/gi, '\n\n') // Paragraphs
              .replace(/<\/p>/gi, '')
              .replace(/<br\s*\/?>/gi, '\n') // Line breaks
              .replace(/<li[^>]*>/gi, '\n- ') // List items
              .replace(/<\/li>/gi, '')
              .replace(/<[^>]+>/g, '') // Remove all other HTML tags
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0)
              .join('\n')

            if (!textContent || textContent.trim().length === 0) {
              return NextResponse.json(
                { error: 'Document appears to be empty after HTML parsing' },
                { status: 400 }
              )
            }

            // Convert text to Lexical format using markdown parser
            console.log(`[Import] Converting exported HTML to Lexical format`)
            const { parseMarkdownToLexical } = await import('@/utilities/markdownToLexical')
            lexicalContent = parseMarkdownToLexical(textContent)
            console.log(`[Import] Parsed ${lexicalContent.root.children.length} content blocks from exported HTML`)
          }

        } catch (exportError) {
          console.error('[Import] Drive API export/convert also failed:', exportError)
          const exportErrorMessage = exportError instanceof Error ? exportError.message : String(exportError)

          // Check if it's the "Export only supports Docs Editors files" error
          if (exportErrorMessage.includes('Export only supports Docs Editors files') || exportErrorMessage.includes('fileNotExportable')) {
            return NextResponse.json(
              {
                error: 'Unsupported file type',
                details: 'The file is a Word document (.docx) or other format that cannot be directly exported. Please convert it to Google Docs format first, or use a native Google Doc.',
                originalError: errorMessage,
              },
              { status: 400 }
            )
          }

          return NextResponse.json(
            {
              error: 'Failed to fetch Google Doc',
              details: 'Both Documents API and Drive API export failed. The document may be restricted or in an unsupported format.',
              originalError: errorMessage,
            },
            { status: 500 }
          )
        }
      } else {
        // For other errors, throw as before
        console.error('[Import] Error fetching document:', error)
        throw new Error(`Failed to fetch Google Doc: ${errorMessage}`)
      }
    }

    if (!lexicalContent) {
      return NextResponse.json(
        { error: 'Document not found or inaccessible' },
        { status: 404 }
      )
    }

    // Track blocks created for API response
    const blocksCreated = {
      faq: 0,
      banner: 0,
      code: 0,
      media: 0,
      total: 0,
    }

    // Detect and extract FAQ sections BEFORE AI enhancement
    console.log(`[Import] 🔍 Detecting FAQ sections...`)
    const { faqBlocks, remainingNodes } = parseFAQsFromLexical(lexicalContent.root.children)

    if (faqBlocks.length > 0) {
      const totalQuestions = faqBlocks.reduce((sum, faq) => {
        const block = faq?.block || faq // Support both old and new format
        return sum + (block?.items?.length || 0)
      }, 0)
      console.log(`[Import] ✅ Found ${faqBlocks.length} FAQ section(s) with ${totalQuestions} total questions`)

      // Use AI to format FAQ questions and answers if enabled (BATCH FORMATTING - 1 API call instead of 12+)
      if (useAI && aiConfig.apiKey) {
        console.log(`[Import] 🤖 Batch formatting FAQ content with AI (1 API call for all FAQs)...`)
        try {
          // Prepare FAQ blocks for batch formatting
          const faqBlocksForFormatting: FAQBlockForFormatting[] = faqBlocks.map(faqWithPos => {
            const block = faqWithPos?.block || faqWithPos // Support both old and new format
            return {
              title: block.title,
              items: block.items.map(item => ({
                question: item.question,
                answer: extractTextFromLexical(item.answer), // Convert Lexical to plain text
              })),
            }
          })

          // Batch format all FAQs in a single API call
          const { batchFormatFAQsWithAI } = await import('@/utilities/aiProvider')
          const formattedFAQsData = await batchFormatFAQsWithAI(
            faqBlocksForFormatting.map((block, blockIndex) => ({
              blockIndex,
              title: block.title || null,
              items: block.items.map((item, itemIndex) => ({
                itemIndex,
                question: item.question,
                answer: item.answer,
              })),
            })),
            async (request, response) => {
              // Save FAQ formatting prompt and API response
              await saveToDocFolder(docId, title, 'ai-faq-prompt.json', request, 'ai')
              await saveToDocFolder(docId, title, 'ai-faq-response.json', response, 'ai')
            }
          )

          // Map formatted results back to original FAQ blocks
          for (let blockIndex = 0; blockIndex < faqBlocks.length; blockIndex++) {
            const faqWithPos = faqBlocks[blockIndex]
            const originalBlock = faqWithPos?.block || faqWithPos // Support both old and new format
            const formattedBlock = formattedFAQsData[blockIndex]

            if (formattedBlock) {
              // Update title if formatted
              if (formattedBlock.title && formattedBlock.title !== originalBlock.title) {
                originalBlock.title = formattedBlock.title
              }

              // Update questions and answers
              for (let itemIndex = 0; itemIndex < originalBlock.items.length; itemIndex++) {
                const originalItem = originalBlock.items[itemIndex]
                const formattedItem = formattedBlock.items[itemIndex]

                if (formattedItem) {
                  // Update question
                  if (formattedItem.question && formattedItem.question !== originalItem.question) {
                    originalBlock.items[itemIndex].question = formattedItem.question.trim()
                  }

                  // Update answer (convert formatted text back to Lexical)
                  if (formattedItem.answer && formattedItem.answer !== extractTextFromLexical(originalItem.answer)) {
                    const { parseMarkdownToLexical } = await import('@/utilities/markdownToLexical')
                    const formattedLexical = parseMarkdownToLexical(formattedItem.answer)
                    // Use the formatted Lexical if it has content, otherwise keep original
                    if (formattedLexical.root.children.length > 0) {
                      originalBlock.items[itemIndex].answer = formattedLexical
                    }
                  }
                }
              }
            }
          }

          console.log(`[Import] ✅ Batch FAQ formatting completed (reduced from ${totalQuestions * 2 + faqBlocks.length} calls to 1 call)`)
        } catch (aiError) {
          console.error(`[Import] ⚠️ Error batch formatting FAQ with AI:`, aiError)
          console.warn(`[Import] Continuing with unformatted FAQ content`)
          // FAQ blocks remain unchanged, will use original content
        }
      }

      // Convert FAQ blocks to Lexical block nodes (Payload CMS format)
      // Sort by insert index (descending) so we can insert from end to beginning
      const sortedFAQBlocks = [...faqBlocks].sort((a, b) => {
        const indexA = a?.insertIndex ?? 0
        const indexB = b?.insertIndex ?? 0
        return indexB - indexA
      })
      
      const finalNodes: LexicalNode[] = [...remainingNodes]
      
      // Insert FAQ blocks at their original positions (insert from end to beginning to preserve indices)
      for (const faqBlockWithPos of sortedFAQBlocks) {
        // Support both old format (direct block) and new format (with position)
        const block = faqBlockWithPos?.block || faqBlockWithPos
        const insertIndex = faqBlockWithPos?.insertIndex ?? finalNodes.length // Default to end if no index
        
        const faqBlockNode = {
          type: 'block' as const,
          fields: {
            blockType: 'faq' as const,
            title: block.title || null,
            items: block.items.map((item, index) => ({
              question: item.question,
              answer: item.answer,
              id: `faq-item-${Date.now()}-${index}`, // Generate unique ID for each item
            })),
          },
          format: '',
          version: 2,
        }
        
        // Insert at the tracked position (or at the end if index is invalid)
        const safeIndex = Math.min(insertIndex, finalNodes.length)
        finalNodes.splice(safeIndex, 0, faqBlockNode)
      }

      lexicalContent.root.children = finalNodes
      blocksCreated.faq = faqBlocks.length
      blocksCreated.total += faqBlocks.length
      console.log(`[Import] ✅ Inserted ${faqBlocks.length} FAQ block(s) at their original positions`)
    } else {
      // No FAQ sections found, use original content
      lexicalContent.root.children = remainingNodes.length > 0 ? remainingNodes : lexicalContent.root.children
      console.log(`[Import] ℹ️  No FAQ sections detected`)
    }

    // Optional AI enhancement
    if (useAI && aiConfig.apiKey) {
      try {
        const providerName = aiConfig.provider === 'openrouter' ? 'OpenRouter' : 'AI'
        console.log(`[Import] 🤖 ========================================`)
        console.log(`[Import] 🤖 AI FORMATTING ENABLED - Using ${providerName}`)
        console.log(`[Import] 🤖 ========================================`)

        // Extract text from Lexical for AI processing
        const textContent = extractTextFromLexical(lexicalContent)
        console.log(`[Import] 📝 Extracted ${textContent.length} characters from Lexical content`)

        if (textContent.trim().length === 0) {
          console.warn(`[Import] ⚠️ No text content to enhance, skipping AI formatting`)
        } else {
          // Enhance text content with AI (preserves structure, improves text quality)
          const enhancedText = await enhanceContentQuality(
            textContent,
            'blog post',
            async (request, response) => {
              // Save content enhancement prompt and API response
              await saveToDocFolder(docId, title, 'ai-content-prompt.json', request, 'ai')
              await saveToDocFolder(docId, title, 'ai-content-response.json', response, 'ai')
            }
          )

          // Instead of replacing the entire structure, enhance text within existing nodes
          // This preserves original formatting, spacing, and design
          console.log(`[Import] 🔄 Enhancing text content while preserving original structure...`)
          lexicalContent = enhanceTextInLexicalNodes(lexicalContent, textContent, enhancedText)

          // Log AI usage results
          console.log(`[Import] ✅ ========================================`)
          console.log(`[Import] ✅ AI TEXT ENHANCEMENT COMPLETED`)
          console.log(`[Import] ✅ ========================================`)
          console.log(`[Import] 📊 Content transformation:`)
          console.log(`[Import]    - Original: ${textContent.length} characters`)
          console.log(`[Import]    - Enhanced: ${enhancedText.length} characters`)
          console.log(`[Import]    - Change: ${enhancedText.length - textContent.length > 0 ? '+' : ''}${enhancedText.length - textContent.length} characters`)
          console.log(`[Import]    - Structure preserved: ✅ Original formatting maintained`)
        }
      } catch (aiError) {
        console.error(`[Import] ❌ ========================================`)
        console.error(`[Import] ❌ AI ENHANCEMENT FAILED`)
        console.error(`[Import] ❌ ========================================`)
        console.error(`[Import] Error:`, aiError)
        if (aiError instanceof Error) {
          console.error(`[Import] Error message:`, aiError.message)
          console.error(`[Import] Error stack:`, aiError.stack)
        }
        console.warn(`[Import] ⚠️ Continuing with original content (no AI enhancement)`)
      }
    } else if (useAI && !aiConfig.apiKey) {
      console.warn(`[Import] ⚠️ ========================================`)
      console.warn(`[Import] ⚠️ AI FORMATTING REQUESTED BUT API KEY NOT SET`)
      console.warn(`[Import] ⚠️ ========================================`)
      console.warn(`[Import] Set OPENROUTER_API_KEY in your .env file to enable AI formatting`)
    } else if (!useAI) {
      console.log(`[Import] ℹ️  AI formatting not requested (useAI: false)`)
    }

    // Process images (optional - continue even if this fails)
    let images: Array<{ url: string; alt?: string; inlineObjectId?: string }> = []
    try {
      console.log(`[Import] Extracting images from document`)
      images = await extractImagesFromExportedDoc(docId, oauth2Client)
      console.log(`[Import] Found ${images.length} images`)
    } catch (imageError) {
      console.warn(`[Import] Image extraction failed (continuing without images):`, imageError)
      // Continue without images - document will still be imported
      if (imageError instanceof Error && imageError.message.includes('Drive API')) {
        console.warn(`[Import] Note: Google Drive API may not be enabled. Images will be skipped.`)
      }
    }

    // Download and upload images to Payload
    const imageMap = new Map<string, number>()
    const payloadReq = await createLocalReq({ user }, payload)

    for (const imageInfo of images) {
      try {
        // Download image using improved handler
        const { downloadImageFromUrl } = await import('@/utilities/googleDocsImageHandler')
        const imageBuffer = await downloadImageFromUrl(imageInfo.url, oauth2Client)

        if (!imageBuffer) {
          console.warn(`Failed to download image: ${imageInfo.url}`)
          continue
        }

        // Determine file extension from URL or default to png
        const urlLower = imageInfo.url.toLowerCase()
        let contentType = 'image/png'
        let extension = 'png'

        if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) {
          contentType = 'image/jpeg'
          extension = 'jpg'
        } else if (urlLower.includes('.gif')) {
          contentType = 'image/gif'
          extension = 'gif'
        } else if (urlLower.includes('.webp')) {
          contentType = 'image/webp'
          extension = 'webp'
        }

        const filename = `google-doc-image-${Date.now()}.${extension}`

        // Upload to Payload - create Payload-compatible file object
        // Payload expects: { name, data (Buffer), mimetype, size }
        const file: { name: string; data: Buffer; mimetype: string; size: number } = {
          name: filename,
          data: imageBuffer,
          mimetype: contentType,
          size: imageBuffer.length,
        }

        const media = await payload.create({
          collection: 'media',
          data: {
            alt: imageInfo.alt || filename,
          },
          file,
          req: payloadReq,
        })

        const mediaId = typeof media.id === 'number' ? media.id : parseInt(media.id as string)
        imageMap.set(imageInfo.url, mediaId)
      } catch (error) {
        console.error('Error processing image:', error)
        // Continue with other images
      }
    }

    // Replace image URLs in content with Payload media blocks
    // For now, we'll add images as MediaBlock nodes after paragraphs
    // This is a simplified approach - in production you might want more sophisticated placement
    const contentWithImages = { ...lexicalContent }

    // Add image blocks after content (simplified - you might want to place them inline)
    if (imageMap.size > 0) {
      const imageBlocks = Array.from(imageMap.values()).map((mediaId) => ({
        type: 'block',
        fields: {
          blockType: 'mediaBlock',
          media: mediaId,
        },
        format: '',
        version: 2,
      }))

      contentWithImages.root.children.push(...imageBlocks)
      blocksCreated.media = imageBlocks.length
      blocksCreated.total += imageBlocks.length
    }

    // Create Payload request object
    const payloadReqForCreate = await createLocalReq({ user }, payload)

    // Check if import record already exists
    const existingImports = await payload.find({
      collection: 'google-doc-imports',
      where: {
        googleDocId: {
          equals: docId,
        },
      },
      limit: 1,
    })

    let post
    let isUpdate = false

    if (existingImports.docs.length > 0) {
      // Update existing post
      const existingImport = existingImports.docs[0]
      const existingPostId = typeof existingImport.post === 'object'
        ? existingImport.post.id
        : existingImport.post

      post = await payload.update({
        collection: 'posts',
        id: existingPostId,
        data: {
          title,
          content: contentWithImages as unknown as Post['content'],
        },
        req: payloadReqForCreate,
      })

      // Update import record
      await payload.update({
        collection: 'google-doc-imports',
        id: existingImport.id,
        data: {
          title,
          lastSyncedAt: new Date().toISOString(),
          status: 'active',
          imagesCount: imageMap.size,
          errorMessage: undefined,
          useAI: useAI, // Update AI preference
        },
        req: payloadReqForCreate,
      })

      isUpdate = true
    } else {
      // Create new post
      post = await payload.create({
        collection: 'posts',
        data: {
          title,
          content: contentWithImages as unknown as Post['content'],
        },
        draft: true, // Import as draft so user can review
        req: payloadReqForCreate,
      })

      // Create import record
      await payload.create({
        collection: 'google-doc-imports',
        data: {
          title,
          googleDocId: docId,
          googleDocUrl: `https://docs.google.com/document/d/${docId}/edit`,
          post: post.id,
          lastSyncedAt: new Date().toISOString(),
          status: 'active',
          imagesCount: imageMap.size,
          useAI: useAI, // Save AI preference
        },
        req: payloadReqForCreate,
      })
    }

    // Count blocks in final content for response
    const finalContent = post.content as any
    if (finalContent?.root?.children) {
      const blockCounts = {
        faq: 0,
        banner: 0,
        code: 0,
        media: 0,
      }

      finalContent.root.children.forEach((node: any) => {
        if (node.type === 'block' && node.fields?.blockType) {
          const blockType = node.fields.blockType
          if (blockType === 'faq') blockCounts.faq++
          else if (blockType === 'banner') blockCounts.banner++
          else if (blockType === 'code') blockCounts.code++
          else if (blockType === 'mediaBlock') blockCounts.media++
        }
      })
      
      // Use actual counts from final content
      blocksCreated.faq = blockCounts.faq
      blocksCreated.banner = blockCounts.banner
      blocksCreated.code = blockCounts.code
      blocksCreated.media = blockCounts.media
      blocksCreated.total = blockCounts.faq + blockCounts.banner + blockCounts.code + blockCounts.media
    }

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
      },
      imagesProcessed: imageMap.size,
      blocks: {
        faq: blocksCreated.faq,
        banner: blocksCreated.banner,
        code: blocksCreated.code,
        media: blocksCreated.media,
        total: blocksCreated.total,
      },
      isUpdate,
    })
  } catch (error) {
    console.error('Import error:', error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('refresh token')) {
        return NextResponse.json(
          {
            error: 'Authentication failed',
            message: 'Please complete OAuth flow again by visiting /api/google-oauth/login',
            details: error.message,
          },
          { status: 401 }
        )
      }

      if (error.message.includes('not found') || error.message.includes('404')) {
        return NextResponse.json(
          { error: 'Document not found or you do not have access to it' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to import document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

