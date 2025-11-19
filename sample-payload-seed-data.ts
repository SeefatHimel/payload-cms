/**
 * Sample Payload CMS seed data for creating posts with FAQ blocks
 * 
 * This file demonstrates the exact structure needed to create posts with
 * embedded FAQ blocks in the richText content field.
 * 
 * Usage:
 * 1. Replace placeholders ({{MEDIA_ID}}, {{USER_ID}}, etc.) with actual IDs
 * 2. Import this function in your seed script
 * 3. Call it with the required dependencies
 */

import type { RequiredDataFromCollectionSlug } from 'payload'

type PostArgs = {
  heroImage: { id: number | string }
  author: { id: number | string }
  category?: { id: number | string }
}

/**
 * Creates a sample post with FAQ blocks embedded in the content
 */
export const createPostWithFAQ: (args: PostArgs) => RequiredDataFromCollectionSlug<'posts'> = ({
  heroImage,
  author,
  category,
}) => {
  return {
    title: 'Getting Started with Payload CMS: A Complete Guide',
    slug: 'getting-started-with-payload-cms',
    _status: 'published',
    heroImage: heroImage.id,
    authors: [author.id],
    categories: category ? [category.id] : [],
    publishedAt: new Date().toISOString(),
    content: {
      root: {
        type: 'root',
        children: [
          // Introduction heading
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
          // Introduction paragraph
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
          // FAQ Block Example
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
          // Conclusion heading
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
          // Conclusion paragraph
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
      image: heroImage.id,
    },
  }
}

/**
 * Helper function to create a simple FAQ block structure
 * This can be used to generate FAQ blocks programmatically
 */
export const createFAQBlock = (title: string, items: Array<{ question: string; answer: string }>) => {
  return {
    type: 'block' as const,
    fields: {
      blockType: 'faq' as const,
      title,
      items: items.map((item) => ({
        question: item.question,
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
                    text: item.answer,
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
      })),
    },
    format: '',
    version: 2,
  }
}

/**
 * Example usage in a seed script:
 * 
 * const post = createPostWithFAQ({
 *   heroImage: image1Doc,
 *   author: demoAuthor,
 *   category: categoryDoc
 * })
 * 
 * await payload.create({
 *   collection: 'posts',
 *   data: post
 * })
 */

