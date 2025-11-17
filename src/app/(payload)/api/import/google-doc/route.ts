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
import type { Post } from '@/payload-types'

export const maxDuration = 300 // 5 minutes for large documents

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
    console.log(`[Import]    - Provider: ${aiConfig.provider === 'openai' ? 'OpenAI' : aiConfig.provider === 'google' ? 'Google Gemini' : 'None'}`)
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
    const docId = extractGoogleDocId(inputDocId.trim())
    
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
    // Drive API not currently used, but kept for future image extraction from Drive
    // const drive = google.drive({ 
    //   version: 'v3', 
    //   auth: oauth2Client
    // })

    // Fetch Google Doc with timeout handling
    console.log(`[Import] Fetching Google Doc: ${docId}`)
    const docResponse = await docs.documents.get({
      documentId: docId,
    }).catch((error) => {
      console.error('[Import] Error fetching document:', error)
      throw new Error(`Failed to fetch Google Doc: ${error instanceof Error ? error.message : 'Unknown error'}`)
    })

    const doc = docResponse.data

    if (!doc) {
      return NextResponse.json(
        { error: 'Document not found or inaccessible' },
        { status: 404 }
      )
    }

    // Get document title
    const title = doc.title || 'Untitled Document'

    // Parse document to Lexical format
    console.log(`[Import] Parsing document to Lexical format`)
    let lexicalContent = parseGoogleDocToLexical(doc)
    console.log(`[Import] Parsed ${lexicalContent.root.children.length} content blocks`)
    
    // Detect and extract FAQ sections BEFORE AI enhancement
    console.log(`[Import] 🔍 Detecting FAQ sections...`)
    const { faqBlocks, remainingNodes } = parseFAQsFromLexical(lexicalContent.root.children)
    
    if (faqBlocks.length > 0) {
      const totalQuestions = faqBlocks.reduce((sum, faq) => sum + faq.items.length, 0)
      console.log(`[Import] ✅ Found ${faqBlocks.length} FAQ section(s) with ${totalQuestions} total questions`)
      
      // Use AI to format FAQ questions and answers if enabled (BATCH FORMATTING - 1 API call instead of 12+)
      if (useAI && process.env.GOOGLE_AI_API_KEY) {
        console.log(`[Import] 🤖 Batch formatting FAQ content with AI (1 API call for all FAQs)...`)
        try {
          // Prepare FAQ blocks for batch formatting
          const faqBlocksForFormatting: FAQBlockForFormatting[] = faqBlocks.map(block => ({
            title: block.title,
            items: block.items.map(item => ({
              question: item.question,
              answer: extractTextFromLexical(item.answer), // Convert Lexical to plain text
            })),
          }))

          // Batch format all FAQs in a single API call
          const formattedFAQs = await batchFormatFAQs(faqBlocksForFormatting)

          // Map formatted results back to original FAQ blocks
          for (let blockIndex = 0; blockIndex < faqBlocks.length; blockIndex++) {
            const originalBlock = faqBlocks[blockIndex]
            const formattedBlock = formattedFAQs[blockIndex]

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
      const faqBlockNodes = faqBlocks.map((faqBlock) => ({
        type: 'block',
        fields: {
          blockType: 'faq',
          title: faqBlock.title || null,
          items: faqBlock.items.map((item, index) => ({
            question: item.question,
            answer: item.answer,
            id: `faq-item-${Date.now()}-${index}`, // Generate unique ID for each item
          })),
        },
        format: '',
        version: 2,
      }))
      
      // Reconstruct content: remaining nodes + FAQ blocks
      // Insert FAQ blocks where they appeared (at the end of remaining content for now)
      lexicalContent.root.children = [...remainingNodes, ...faqBlockNodes]
      console.log(`[Import] ✅ Inserted ${faqBlockNodes.length} FAQ block(s) into content`)
    } else {
      // No FAQ sections found, use original content
      lexicalContent.root.children = remainingNodes.length > 0 ? remainingNodes : lexicalContent.root.children
      console.log(`[Import] ℹ️  No FAQ sections detected`)
    }

    // Optional AI enhancement
    if (useAI && aiConfig.apiKey) {
      try {
        const providerName = aiConfig.provider === 'openai' ? 'OpenAI' : aiConfig.provider === 'google' ? 'Google Gemini' : 'AI'
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
          const enhancedText = await enhanceContentQuality(textContent, 'blog post')
          
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
    } else if (useAI && !process.env.GOOGLE_AI_API_KEY) {
      console.warn(`[Import] ⚠️ ========================================`)
      console.warn(`[Import] ⚠️ AI FORMATTING REQUESTED BUT API KEY NOT SET`)
      console.warn(`[Import] ⚠️ ========================================`)
      console.warn(`[Import] Set GOOGLE_AI_API_KEY in your .env file to enable AI formatting`)
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

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
      },
      imagesProcessed: imageMap.size,
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

