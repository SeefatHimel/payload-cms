import { google } from 'googleapis'
import axios from 'axios'
import FormData from 'form-data'
import OpenAI from 'openai'
import fs from 'fs'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// ------------------ Authenticate Google Docs ------------------
function getGoogleClient() {
  const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!keyFile) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is required')
  }

  // Handle both relative and absolute paths
  const keyPath = path.isAbsolute(keyFile) 
    ? keyFile 
    : path.resolve(__dirname, '..', keyFile)

  if (!fs.existsSync(keyPath)) {
    throw new Error(`Service account key file not found: ${keyPath}`)
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/documents.readonly'],
  })

  return google.docs({ version: 'v1', auth })
}

// ------------------ Extract Text from Google Doc ------------------
function extractText(doc) {
  let text = ''
  
  if (!doc.body || !doc.body.content) {
    return text
  }

  function extractFromElement(element) {
    if (!element) return ''

    if (element.paragraph) {
      return element.paragraph.elements
        ?.map((e) => {
          if (e.textRun) {
            return e.textRun.content || ''
          }
          return ''
        })
        .join('') || ''
    }

    if (element.table) {
      return element.table.tableRows
        ?.map((row) =>
          row.tableCells
            ?.map((cell) =>
              cell.content
                ?.map((c) => extractFromElement(c))
                .join('') || ''
            )
            .join('\t')
        )
        .join('\n') || ''
    }

    return ''
  }

  return doc.body.content
    .map((element) => extractFromElement(element))
    .filter((text) => text.trim().length > 0)
    .join('\n\n')
}

// ------------------ Extract Inline Images from Google Doc ------------------
async function extractImages(doc) {
  const images = []
  
  if (!doc.inlineObjects) {
    return images
  }

  for (const [objectId, inlineObject] of Object.entries(doc.inlineObjects)) {
    const embedded = inlineObject.inlineObjectProperties?.embeddedObject
    
    if (embedded?.imageProperties?.contentUri) {
      const imageUrl = embedded.imageProperties.contentUri
      
      try {
        const response = await axios.get(imageUrl, { 
          responseType: 'arraybuffer',
          timeout: 30000 
        })
        
        // Determine file extension from content type or default to png
        const contentType = response.headers['content-type'] || 'image/png'
        const extension = contentType.includes('jpeg') || contentType.includes('jpg') 
          ? 'jpg' 
          : contentType.includes('png') 
          ? 'png' 
          : contentType.includes('gif')
          ? 'gif'
          : contentType.includes('webp')
          ? 'webp'
          : 'png'

        images.push({
          id: objectId,
          url: imageUrl,
          buffer: Buffer.from(response.data),
          extension,
          contentType,
        })
      } catch (error) {
        console.warn(`Failed to download image ${imageUrl}:`, error.message)
      }
    }
  }

  return images
}

// ------------------ Convert Plain Text to Basic Lexical Format ------------------
function convertTextToLexical(text) {
  // Split text into paragraphs
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  
  const children = paragraphs.map((para) => {
    const trimmed = para.trim()
    
    // Check if it's a heading (starts with # or is all caps and short)
    if (trimmed.startsWith('# ')) {
      return {
        type: 'heading',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: trimmed.substring(2).trim(),
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        tag: 'h1',
        version: 1,
      }
    } else if (trimmed.startsWith('## ')) {
      return {
        type: 'heading',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: trimmed.substring(3).trim(),
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        tag: 'h2',
        version: 1,
      }
    } else if (trimmed.startsWith('### ')) {
      return {
        type: 'heading',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: trimmed.substring(4).trim(),
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        tag: 'h3',
        version: 1,
      }
    } else {
      // Regular paragraph
      return {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: trimmed,
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        version: 1,
      }
    }
  })

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

// ------------------ Upload Image to Payload CMS ------------------
async function uploadImageToPayload(buffer, filename, contentType) {
  const form = new FormData()
  form.append('file', buffer, {
    filename,
    contentType,
  })

  const apiUrl = process.env.PAYLOAD_API_URL || 'http://localhost:3000/api'
  const apiKey = process.env.PAYLOAD_API_KEY

  if (!apiKey) {
    throw new Error('PAYLOAD_API_KEY environment variable is required')
  }

  try {
    const response = await axios.post(`${apiUrl}/media`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `JWT ${apiKey}`,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })

    return response.data.doc?.id || response.data.id
  } catch (error) {
    console.error('Error uploading image to Payload:', error.response?.data || error.message)
    throw error
  }
}

// ------------------ Authenticate with Payload CMS ------------------
async function authenticatePayload() {
  const apiUrl = process.env.PAYLOAD_API_URL || 'http://localhost:3000/api'
  const email = process.env.PAYLOAD_EMAIL
  const password = process.env.PAYLOAD_PASSWORD

  if (!email || !password) {
    throw new Error('PAYLOAD_EMAIL and PAYLOAD_PASSWORD are required for authentication')
  }

  try {
    const response = await axios.post(`${apiUrl}/users/login`, {
      email,
      password,
    })

    return response.data.token
  } catch (error) {
    console.error('Error authenticating with Payload:', error.response?.data || error.message)
    throw error
  }
}

// ------------------ AI Enhance Content ------------------
async function enhanceContent(text) {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set, skipping AI enhancement')
    return {
      title: text.split('\n')[0].substring(0, 100) || 'Untitled Post',
      slug: text
        .split('\n')[0]
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'untitled-post',
      metaDescription: text.substring(0, 160) || '',
      tags: '',
      content: text,
    }
  }

  const prompt = `Rewrite the following blog content into a clean, SEO-optimized, engaging article. 
Do not add false facts. Improve structure, headers, formatting.

Also generate:
- title (compelling, SEO-friendly, max 60 chars)
- slug (SEO friendly, lowercase, hyphens)
- metaDescription (150-160 chars)
- tags (comma separated list, max 5 tags)
- content (improved, well-structured content with proper headings)

Return ONLY valid JSON in this exact format:
{
  "title": "Article Title",
  "slug": "article-slug",
  "metaDescription": "Meta description here",
  "tags": "tag1, tag2, tag3",
  "content": "Improved content here with proper formatting"
}

CONTENT:
${text.substring(0, 8000)}`

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a content editor that improves blog posts for SEO and readability. Always return valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const content = completion.choices[0]?.message?.content || '{}'
    
    // Extract JSON from response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? jsonMatch[0] : content
    
    return JSON.parse(jsonStr)
  } catch (error) {
    console.error('Error enhancing content with AI:', error.message)
    // Fallback to basic extraction
    const firstLine = text.split('\n')[0] || 'Untitled Post'
    return {
      title: firstLine.substring(0, 100),
      slug: firstLine
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'untitled-post',
      metaDescription: text.substring(0, 160) || '',
      tags: '',
      content: text,
    }
  }
}

// ------------------ Create Blog Post in Payload CMS ------------------
async function createBlogPost(data, token) {
  const apiUrl = process.env.PAYLOAD_API_URL || 'http://localhost:3000/api'

  try {
    const response = await axios.post(
      `${apiUrl}/posts`,
      {
        ...data,
        _status: 'published', // Publish immediately, or use 'draft' to save as draft
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
      }
    )

    return response.data
  } catch (error) {
    console.error('Error creating post in Payload:', error.response?.data || error.message)
    throw error
  }
}

// ------------------ MAIN PROCESS ------------------
async function processGoogleDoc(docId) {
  try {
    console.log('📄 Fetching Google Doc...')
    const docsClient = getGoogleClient()
    const { data: doc } = await docsClient.documents.get({ documentId: docId })

    console.log('📝 Extracting text...')
    const rawText = extractText(doc)

    if (!rawText || rawText.trim().length === 0) {
      throw new Error('No text content found in the Google Doc')
    }

    console.log('🖼️  Extracting images...')
    const images = await extractImages(doc)
    console.log(`Found ${images.length} image(s)`)

    // Authenticate with Payload
    let token = process.env.PAYLOAD_API_KEY
    if (!token) {
      console.log('🔐 Authenticating with Payload CMS...')
      token = await authenticatePayload()
    }

    // Upload images to Payload
    const uploadedImageIds = []
    for (const image of images) {
      console.log(`📤 Uploading image ${image.id}...`)
      const filename = `image-${image.id}.${image.extension}`
      const imageId = await uploadImageToPayload(image.buffer, filename, image.contentType)
      uploadedImageIds.push(imageId)
      console.log(`✅ Image uploaded with ID: ${imageId}`)
    }

    // Use first uploaded image as hero image if available
    const heroImageId = uploadedImageIds.length > 0 ? uploadedImageIds[0] : undefined

    // Enhance content using AI
    console.log('🤖 Enhancing content with AI...')
    const enhanced = await enhanceContent(rawText)

    // Convert enhanced content to Lexical format
    const lexicalContent = convertTextToLexical(enhanced.content)

    // Parse tags
    const tags = enhanced.tags
      ? enhanced.tags.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
      : []

    // Create post data
    const postData = {
      title: enhanced.title,
      slug: enhanced.slug,
      content: lexicalContent,
      meta: {
        title: enhanced.title,
        description: enhanced.metaDescription,
        ...(heroImageId && { image: heroImageId }),
      },
      ...(heroImageId && { heroImage: heroImageId }),
    }

    console.log('📝 Creating blog post in Payload CMS...')
    const result = await createBlogPost(postData, token)

    console.log('✅ Success! Post created:', {
      id: result.doc?.id || result.id,
      title: result.doc?.title || result.title,
      slug: result.doc?.slug || result.slug,
      url: `${process.env.PAYLOAD_API_URL?.replace('/api', '') || 'http://localhost:3000'}/posts/${result.doc?.slug || result.slug}`,
    })

    return result
  } catch (error) {
    console.error('❌ Error processing Google Doc:', error.message)
    throw error
  }
}

// ------------------ CLI Interface ------------------
const docId = process.argv[2]

if (!docId) {
  console.error('Usage: node scripts/fetchDoc.js <GOOGLE_DOC_ID>')
  console.error('')
  console.error('Example:')
  console.error('  node scripts/fetchDoc.js 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms')
  process.exit(1)
}

processGoogleDoc(docId)
  .then(() => {
    console.log('✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  })

