/**
 * Script to create a Payload CMS post from an AI-generated API response
 * 
 * This script simulates receiving an AI response (in API response format)
 * and converts it to create a post in Payload CMS
 */

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { RequiredDataFromCollectionSlug } from 'payload'

// This is the "AI API Response" - what the AI would return
const aiResponse = {
  id: 1,
  title: 'Getting Started with Payload CMS: A Complete Guide',
  slug: 'getting-started-with-payload-cms',
  _status: 'published',
  createdAt: '2025-01-18T12:00:00.000Z',
  updatedAt: '2025-01-18T12:00:00.000Z',
  publishedAt: '2025-01-18T12:00:00.000Z',
  heroImage: {
    id: 1,
    alt: 'Payload CMS hero image',
    url: '/media/payload-cms-hero.jpg',
    filename: 'payload-cms-hero.jpg',
  },
  authors: [
    {
      id: 1,
      name: 'Demo Author',
      email: 'demo-author@example.com',
    },
  ],
  categories: [
    {
      id: 1,
      title: 'Technology',
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
          type: 'paragraph',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'In this comprehensive guide, we\'ll explore the key features and best practices for working with Payload CMS, including how to use blocks for dynamic content creation.',
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
              {
                question: 'What databases does Payload CMS support?',
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
                            text: 'Payload CMS supports multiple databases including MongoDB, PostgreSQL, and SQLite. You can choose the database adapter that best fits your project requirements.',
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
        {
          type: 'heading',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Conclusion',
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
              text: 'Payload CMS is a powerful and flexible solution for managing content in modern web applications. With its TypeScript-first approach, flexible block system, and comprehensive feature set, it\'s an excellent choice for developers who want full control over their content management system.',
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
  meta: {
    title: 'Getting Started with Payload CMS: A Complete Guide',
    description:
      'Learn everything you need to know about Payload CMS, including installation, features, and how to use custom blocks like FAQ blocks.',
    image: {
      id: 1,
      alt: 'Payload CMS hero image',
      url: '/media/payload-cms-hero.jpg',
    },
  },
}

/**
 * Converts AI API response format to Payload CMS create format
 * - Extracts IDs from populated relationships
 * - Removes read-only fields (id, createdAt, updatedAt)
 * - Keeps the content structure as-is (it's already in the correct format)
 */
function convertAIResponseToCreateFormat(
  aiResponseData: typeof aiResponse,
): RequiredDataFromCollectionSlug<'posts'> {
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
        ? aiResponseData.authors.map((author) =>
            typeof author === 'object' && 'id' in author ? author.id : author,
          )
        : [],
    categories:
      Array.isArray(aiResponseData.categories) && aiResponseData.categories.length > 0
        ? aiResponseData.categories.map((category) =>
            typeof category === 'object' && 'id' in category ? category.id : category,
          )
        : [],
    content: aiResponseData.content, // Content structure is already correct
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

/**
 * Main function to create a post from AI response
 */
async function createPostFromAIResponse() {
  try {
    console.log('🚀 Starting post creation from AI response...')
    console.log('📝 AI Response received:', {
      title: aiResponse.title,
      slug: aiResponse.slug,
      hasFAQBlock: aiResponse.content.root.children.some(
        (child: any) => child.type === 'block' && child.fields?.blockType === 'faq',
      ),
    })

    const payload = await getPayload({ config: configPromise })

    // Get or create required dependencies
    console.log('🔍 Checking for required dependencies...')

    // Get or create author
    let author
    const authorEmail = aiResponse.authors[0]?.email || 'demo-author@example.com'
    const existingAuthors = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: authorEmail,
        },
      },
    })

    if (existingAuthors.docs.length > 0) {
      author = existingAuthors.docs[0]
      console.log('✅ Found existing author:', author.email)
    } else {
      author = await payload.create({
        collection: 'users',
        data: {
          name: aiResponse.authors[0]?.name || 'Demo Author',
          email: authorEmail,
          password: 'password', // In production, use secure password
        },
      })
      console.log('✅ Created new author:', author.email)
    }

    // Get or create category
    let category
    const categorySlug = aiResponse.categories[0]?.slug || 'technology'
    const existingCategories = await payload.find({
      collection: 'categories',
      where: {
        slug: {
          equals: categorySlug,
        },
      },
    })

    if (existingCategories.docs.length > 0) {
      category = existingCategories.docs[0]
      console.log('✅ Found existing category:', category.title)
    } else {
      category = await payload.create({
        collection: 'categories',
        data: {
          title: aiResponse.categories[0]?.title || 'Technology',
          slug: categorySlug,
        },
      })
      console.log('✅ Created new category:', category.title)
    }

    // Get or create hero image (using a placeholder - in real scenario, you'd upload the actual image)
    let heroImage
    const existingMedia = await payload.find({
      collection: 'media',
      limit: 1,
    })

    if (existingMedia.docs.length > 0) {
      heroImage = existingMedia.docs[0]
      console.log('✅ Using existing media:', heroImage.filename)
    } else {
      console.log('⚠️  No media found. You may need to upload a hero image first.')
      console.log('   For now, we\'ll create the post without a hero image.')
    }

    // Convert AI response to create format
    const postData = convertAIResponseToCreateFormat(aiResponse)

    // Replace with actual IDs
    postData.authors = [author.id]
    postData.categories = [category.id]
    if (heroImage) {
      postData.heroImage = heroImage.id
      postData.meta.image = heroImage.id
    }

    // Check if post with this slug already exists
    const existingPosts = await payload.find({
      collection: 'posts',
      where: {
        slug: {
          equals: postData.slug,
        },
      },
    })

    if (existingPosts.docs.length > 0) {
      console.log('⚠️  Post with slug already exists. Updating instead of creating...')
      const existingPost = existingPosts.docs[0]
      const updatedPost = await payload.update({
        collection: 'posts',
        id: existingPost.id,
        data: postData,
      })
      console.log('✅ Post updated successfully!')
      console.log('📄 Post ID:', updatedPost.id)
      console.log('🔗 View at:', `/posts/${updatedPost.slug}`)
      return updatedPost
    }

    // Create the post
    console.log('📝 Creating post...')
    const createdPost = await payload.create({
      collection: 'posts',
      data: postData,
      context: {
        disableRevalidate: true, // Disable revalidation during creation
      },
    })

    console.log('✅ Post created successfully!')
    console.log('📄 Post ID:', createdPost.id)
    console.log('📝 Title:', createdPost.title)
    console.log('🔗 Slug:', createdPost.slug)
    console.log('📊 FAQ Items:', 
      aiResponse.content.root.children
        .find((child: any) => child.type === 'block' && child.fields?.blockType === 'faq')
        ?.fields?.items?.length || 0
    )
    console.log('🔗 View at:', `/posts/${createdPost.slug}`)

    return createdPost
  } catch (error) {
    console.error('❌ Error creating post:', error)
    throw error
  }
}

// Run the script if executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('createPostFromAIResponse')) {
  createPostFromAIResponse()
    .then(() => {
      console.log('✨ Script completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Script failed:', error)
      process.exit(1)
    })
}

export { createPostFromAIResponse, convertAIResponseToCreateFormat }

