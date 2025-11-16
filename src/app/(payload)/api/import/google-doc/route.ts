import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { createLocalReq } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { getAccessToken } from '@/utilities/googleOAuth'
import { parseGoogleDocToLexical } from '@/utilities/googleDocsParser'
import { extractImagesFromExportedDoc } from '@/utilities/googleDocsImageHandler'
import { extractGoogleDocId, isValidGoogleDocId } from '@/utilities/extractGoogleDocId'
import { google } from 'googleapis'
import type { Post } from '@/payload-types'

export const maxDuration = 300 // 5 minutes for large documents

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
    const { docId: inputDocId } = body

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
    const lexicalContent = parseGoogleDocToLexical(doc)
    console.log(`[Import] Parsed ${lexicalContent.root.children.length} content blocks`)

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

