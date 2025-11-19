import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createLocalReq } from 'payload'
import { headers } from 'next/headers'
import type { RequiredDataFromCollectionSlug } from 'payload'

/**
 * API endpoint to create a post from an AI-generated response
 * 
 * This endpoint accepts an AI response (in API response format) and creates a post
 * 
 * POST /api/create-post-from-ai
 * Body: { aiResponse: {...} }
 */

// Sample AI response structure (this would come from the request body)
const sampleAIResponse = {
  title: 'Getting Started with Payload CMS: A Complete Guide',
  slug: 'getting-started-with-payload-cms',
  _status: 'published',
  publishedAt: new Date().toISOString(),
  heroImage: {
    id: 1,
  },
  authors: [
    {
      id: 1,
      email: 'demo-author@example.com',
    },
  ],
  categories: [
    {
      id: 1,
      slug: 'technology',
    },
  ],
  content: {
    root: {
      type: 'root',
      children: [
        {
          type: 'heading',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Introduction to Payload CMS',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          tag: 'h2',
          version: 1,
        },
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Payload CMS is a powerful headless content management system built with TypeScript. It provides a flexible and developer-friendly way to manage content for modern web applications.',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          version: 1,
        },
        {
          type: 'block',
          fields: {
            blockType: 'faq',
            title: 'Frequently Asked Questions',
            items: [
              {
                question: 'What is Payload CMS?',
                answer: {
                  root: {
                    type: 'root',
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'text',
                            detail: 0,
                            format: 0,
                            mode: 'normal',
                            style: '',
                            text: 'Payload CMS is a headless content management system built with TypeScript and Node.js. It provides a self-hosted, API-first solution for managing content with a powerful admin panel and flexible data modeling capabilities.',
                            version: 1,
                          },
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        textFormat: 0,
                        version: 1,
                      },
                    ],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    version: 1,
                  },
                },
              },
              {
                question: 'How do I install Payload CMS?',
                answer: {
                  root: {
                    type: 'root',
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'text',
                            detail: 0,
                            format: 0,
                            mode: 'normal',
                            style: '',
                            text: 'You can install Payload CMS using npm or yarn. The easiest way is to use the official CLI:',
                            version: 1,
                          },
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        textFormat: 0,
                        version: 1,
                      },
                      {
                        type: 'code',
                        children: [
                          {
                            type: 'text',
                            detail: 0,
                            format: 0,
                            mode: 'normal',
                            style: '',
                            text: 'npx create-payload-app@latest my-app',
                            version: 1,
                          },
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        language: 'bash',
                        version: 1,
                      },
                    ],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    version: 1,
                  },
                },
              },
              {
                question: 'Can I use custom blocks in Payload CMS?',
                answer: {
                  root: {
                    type: 'root',
                    children: [
                      {
                        type: 'paragraph',
                        children: [
                          {
                            type: 'text',
                            detail: 0,
                            format: 0,
                            mode: 'normal',
                            style: '',
                            text: 'Yes! Payload CMS supports custom blocks through its rich text editor. You can create custom blocks like FAQ blocks, banner blocks, code blocks, and more. Each block can have its own fields and React component for rendering.',
                            version: 1,
                          },
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        textFormat: 0,
                        version: 1,
                      },
                    ],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    version: 1,
                  },
                },
              },
            ],
          },
          format: '',
          version: 2,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  },
  meta: {
    title: 'Getting Started with Payload CMS: A Complete Guide',
    description:
      'Learn everything you need to know about Payload CMS, including installation, features, and how to use custom blocks like FAQ blocks.',
    image: {
      id: 1,
    },
  },
}

function convertAIResponseToCreateFormat(aiResponseData: any): RequiredDataFromCollectionSlug<'posts'> {
  return {
    title: aiResponseData.title,
    slug: aiResponseData.slug,
    _status: aiResponseData._status as 'published' | 'draft',
    heroImage:
      typeof aiResponseData.heroImage === 'object' && 'id' in aiResponseData.heroImage
        ? aiResponseData.heroImage.id
        : aiResponseData.heroImage,
    authors:
      Array.isArray(aiResponseData.authors) && aiResponseData.authors.length > 0
        ? aiResponseData.authors.map((author: any) =>
            typeof author === 'object' && 'id' in author ? author.id : author,
          )
        : [],
    categories:
      Array.isArray(aiResponseData.categories) && aiResponseData.categories.length > 0
        ? aiResponseData.categories.map((category: any) =>
            typeof category === 'object' && 'id' in category ? category.id : category,
          )
        : [],
    content: aiResponseData.content,
    publishedAt: aiResponseData.publishedAt,
    meta: {
      title: aiResponseData.meta.title,
      description: aiResponseData.meta.description,
      image:
        typeof aiResponseData.meta.image === 'object' && 'id' in aiResponseData.meta.image
          ? aiResponseData.meta.image.id
          : aiResponseData.meta.image,
    },
  }
}

export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get AI response from request body, or use sample
    const body = await request.json().catch(() => ({}))
    const aiResponse = body.aiResponse || sampleAIResponse

    console.log('🚀 Creating post from AI response...')
    console.log('📝 Title:', aiResponse.title)
    console.log('🔗 Slug:', aiResponse.slug)

    const payloadReq = await createLocalReq({ user }, payload)

    // Get or create dependencies
    let author
    const authorEmail = aiResponse.authors?.[0]?.email || 'demo-author@example.com'
    const existingAuthors = await payload.find({
      collection: 'users',
      where: { email: { equals: authorEmail } },
      req: payloadReq,
    })

    if (existingAuthors.docs.length > 0) {
      author = existingAuthors.docs[0]
    } else {
      author = await payload.create({
        collection: 'users',
        data: {
          name: aiResponse.authors?.[0]?.name || 'Demo Author',
          email: authorEmail,
          password: 'password',
        },
        req: payloadReq,
      })
    }

    // Get or create category
    let category
    const categorySlug = aiResponse.categories?.[0]?.slug || 'technology'
    const existingCategories = await payload.find({
      collection: 'categories',
      where: { slug: { equals: categorySlug } },
      req: payloadReq,
    })

    if (existingCategories.docs.length > 0) {
      category = existingCategories.docs[0]
    } else {
      category = await payload.create({
        collection: 'categories',
        data: {
          title: aiResponse.categories?.[0]?.title || 'Technology',
          slug: categorySlug,
        },
        req: payloadReq,
      })
    }

    // Get existing media if available
    const existingMedia = await payload.find({
      collection: 'media',
      limit: 1,
      req: payloadReq,
    })
    const heroImage = existingMedia.docs[0]

    // Convert AI response to create format
    const postData = convertAIResponseToCreateFormat(aiResponse)
    postData.authors = [author.id]
    postData.categories = [category.id]
    if (heroImage) {
      postData.heroImage = heroImage.id
      postData.meta.image = heroImage.id
    }

    // Check if post exists
    const existingPosts = await payload.find({
      collection: 'posts',
      where: { slug: { equals: postData.slug } },
      req: payloadReq,
    })

    let result
    if (existingPosts.docs.length > 0) {
      result = await payload.update({
        collection: 'posts',
        id: existingPosts.docs[0].id,
        data: postData,
        req: payloadReq,
      })
      console.log('✅ Post updated')
    } else {
      result = await payload.create({
        collection: 'posts',
        data: postData,
        req: payloadReq,
      })
      console.log('✅ Post created')
    }

    const faqBlock = aiResponse.content.root.children.find(
      (child: any) => child.type === 'block' && child.fields?.blockType === 'faq',
    )

    return Response.json({
      success: true,
      post: {
        id: result.id,
        title: result.title,
        slug: result.slug,
        faqItems: faqBlock?.fields?.items?.length || 0,
      },
      message: 'Post created successfully from AI response!',
    })
  } catch (error: any) {
    console.error('❌ Error:', error)
    return Response.json(
      {
        error: 'Failed to create post',
        message: error.message,
      },
      { status: 500 },
    )
  }
}

