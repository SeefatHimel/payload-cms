/**
 * Google Docs Image Handler
 * 
 * Downloads images from Google Docs/Drive and uploads them to Payload CMS
 */

import type { Payload } from 'payload'
import type { PayloadRequest } from 'payload'
import { google } from 'googleapis'
import type { docs_v1 } from 'googleapis'

/**
 * Download image from Google Drive
 * @deprecated Not currently used
 */
async function _downloadImageFromDrive(
  fileId: string,
  accessToken: string
): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const drive = google.drive({ version: 'v3', auth: { getAccessToken: async () => accessToken } as any })
  
  const response = await drive.files.get(
    {
      fileId,
      alt: 'media',
    },
    {
      responseType: 'arraybuffer',
    }
  )

  return Buffer.from(response.data as ArrayBuffer)
}

/**
 * Get image from Google Docs inline object
 * @deprecated Not currently used
 */
async function _getImageFromInlineObject(
  docId: string,
  inlineObjectId: string,
  accessToken: string
): Promise<Buffer | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docs = google.docs({ version: 'v1', auth: { getAccessToken: async () => accessToken } as any })
    
    // Get the document to find the inline object
    const doc = await docs.documents.get({
      documentId: docId,
    })

    const inlineObject = doc.data.inlineObjects?.[inlineObjectId]
    if (!inlineObject?.inlineObjectProperties?.embeddedObject?.imageProperties?.contentUri) {
      return null
    }

    // Extract file ID from content URI
    // Google Docs stores images in Drive, we need to extract the file ID
    // const contentUri = inlineObject.inlineObjectProperties.embeddedObject.imageProperties.contentUri
    
    // Try to extract file ID from URI or use alternative method
    // For now, we'll try to get it from the embedded object
    // const embeddedObject = inlineObject.inlineObjectProperties.embeddedObject
    
    // Alternative: Get image via Drive API using the document's images
    // We'll need to list files in Drive or use a different approach
    
    // For now, return null and we'll handle this differently
    // The image might be accessible via the document's revision or export
    return null
  } catch (error) {
    console.error('Error getting image from inline object:', error)
    return null
  }
}

/**
 * Upload image to Payload CMS media collection
 * @deprecated Not currently used
 */
async function _uploadImageToPayload(
  payload: Payload,
  req: PayloadRequest,
  imageBuffer: Buffer,
  filename: string,
  alt?: string
): Promise<number> {
  // Create Payload-compatible file object
  // Payload expects: { name, data (Buffer), mimetype, size }
  const file: { name: string; data: Buffer; mimetype: string; size: number } = {
    name: filename,
    data: imageBuffer,
    mimetype: 'image/png',
    size: imageBuffer.length,
  }

  // Upload to Payload
  const media = await payload.create({
    collection: 'media',
    data: {
      alt: alt || filename,
    },
    file,
    req,
  })

  return typeof media.id === 'number' ? media.id : parseInt(media.id as string)
}

/**
 * Process and upload all images from a Google Doc
 * Returns a map of inlineObjectId -> Payload media ID
 */
export async function processGoogleDocImages(
  doc: docs_v1.Schema$Document,
  _docId: string,
  _accessToken: string,
  _payload: Payload,
  _req: PayloadRequest
): Promise<Map<string, number>> {
  const imageMap = new Map<string, number>()

  if (!doc.inlineObjects) {
    return imageMap
  }

  for (const [inlineObjectId, inlineObject] of Object.entries(doc.inlineObjects)) {
    try {
      const embeddedObject = inlineObject.inlineObjectProperties?.embeddedObject
      if (!embeddedObject?.imageProperties) {
        continue
      }

      // Try to get image data
      // Google Docs API doesn't directly provide image download URLs
      // We need to export the document or use Drive API
      
      // Alternative approach: Export document as HTML and extract images
      // Or use the revision API to get image data
      
      // For now, we'll skip inline images and log a warning
      // In production, you might need to:
      // 1. Export document as HTML and parse image URLs
      // 2. Use Drive API to find associated image files
      // 3. Use the revision API to get image data
      
      console.warn(`Skipping inline image ${inlineObjectId} - direct download not available via current API`)
    } catch (error) {
      console.error(`Error processing image ${inlineObjectId}:`, error)
    }
  }

  return imageMap
}

/**
 * Alternative: Export document and extract images from HTML
 * This is a workaround since Google Docs API doesn't provide direct image download
 */
export async function extractImagesFromExportedDoc(
  docId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oauth2Client: any
): Promise<Array<{ url: string; alt?: string; inlineObjectId?: string }>> {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client })
    
    // Export document as HTML
    const response = await drive.files.export(
      {
        fileId: docId,
        mimeType: 'text/html',
      },
      {
        responseType: 'text',
      }
    )

    const html = response.data as string
    
    // Extract image URLs from HTML
    // Google Docs exports images as base64 data URLs or as Google Drive URLs
    const imageRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi
    const images: Array<{ url: string; alt?: string; inlineObjectId?: string }> = []
    let match

    while ((match = imageRegex.exec(html)) !== null) {
      const url = match[1]
      
      // Skip data URLs (base64) as they're already embedded
      if (url.startsWith('data:')) {
        continue
      }
      
      // Extract alt text if available
      const altMatch = html.substring(match.index).match(/alt="([^"]*)"/i)
      
      // Try to extract inline object ID from the image element
      const inlineObjectMatch = html.substring(match.index).match(/data-inline-object-id="([^"]*)"/i)
      
      images.push({
        url,
        alt: altMatch ? altMatch[1] : undefined,
        inlineObjectId: inlineObjectMatch ? inlineObjectMatch[1] : undefined,
      })
    }

    return images
  } catch (error) {
    console.error('Error extracting images from exported doc:', error)
    return []
  }
}

/**
 * Download image from URL (handles both Google Drive URLs and direct URLs)
 */
export async function downloadImageFromUrl(
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oauth2Client: any
): Promise<Buffer | null> {
  try {
    // Get access token from the OAuth client
    const accessToken = await oauth2Client.getAccessToken()
    const token = typeof accessToken === 'string' ? accessToken : accessToken.token
    
    // If it's a Google Drive URL, we might need to use the Drive API
    // For now, try direct fetch first
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      // If direct fetch fails, try to extract file ID from Google Drive URL
      const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
      if (driveMatch) {
        const fileId = driveMatch[1]
        const drive = google.drive({ version: 'v3', auth: oauth2Client })
        const fileResponse = await drive.files.get(
          {
            fileId,
            alt: 'media',
          },
          {
            responseType: 'arraybuffer',
          }
        )
        return Buffer.from(fileResponse.data as ArrayBuffer)
      }
      
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.error('Error downloading image:', error)
    return null
  }
}

