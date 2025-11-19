import axios from 'axios'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Hardcoded JWT token
const PAYLOAD_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiY29sbGVjdGlvbiI6InVzZXJzIiwiZW1haWwiOiJzZWVmYXRoaW1lbDFAZ21haWwuY29tIiwic2lkIjoiNjBjNjVjM2MtZGY0Ni00MDAwLWIyN2QtMTkwZWNkYjUyMzMzIiwiaWF0IjoxNzYzNDU0ODc2LCJleHAiOjE3NjM0NjIwNzZ9.aXAlsskO9UQo8HEdEQoPe3CL40BiuRe7ZTBQuI8c3Tg'

// API URL - use environment variable or default to localhost
const getApiUrl = () => {
  if (process.env.PAYLOAD_API_URL) {
    return process.env.PAYLOAD_API_URL
  }
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
}
const API_URL = getApiUrl()

// Helper function to convert simple format to Lexical format
function convertToLexical(nodes: any[]): any {
  const children = nodes.map((node) => {
    if (node.type === 'h1') {
      return {
        type: 'heading',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: node.children[0].text,
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        tag: 'h1',
        version: 1,
      }
    } else if (node.type === 'h2') {
      return {
        type: 'heading',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: node.children[0].text,
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        tag: 'h2',
        version: 1,
      }
    } else if (node.type === 'h3') {
      return {
        type: 'heading',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: node.children[0].text,
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        tag: 'h3',
        version: 1,
      }
    } else if (node.type === 'p') {
      return {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: node.children[0].text,
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        version: 1,
      }
    } else if (node.type === 'hr') {
      return {
        type: 'horizontalrule',
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      }
    }
    return null
  }).filter(Boolean)

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

async function createTestPost() {
  try {
    console.log('Using hardcoded JWT token for authentication...')
    console.log('API URL:', API_URL)

    // Convert the simple format to Lexical format
    const richTextNodes = [
      // Heading 1
      {
        type: 'h1',
        children: [{ text: 'MyBlogPostTitle' }],
      },
      // Intro paragraph
      {
        type: 'p',
        children: [
          {
            text: 'This is the introduction paragraph of my blog post. Here I explain what the post is about.',
          },
        ],
      },
      // Main section heading
      {
        type: 'h2',
        children: [{ text: 'MainContentSection' }],
      },
      // Main content
      {
        type: 'p',
        children: [{ text: 'This is the main content of the blog post. You can write anything here.' }],
      },
      // Subsection
      {
        type: 'h3',
        children: [{ text: 'Subsection' }],
      },
      {
        type: 'p',
        children: [{ text: 'More content here...' }],
      },
      // FAQ Section
      {
        type: 'h2',
        children: [{ text: 'FAQ' }],
      },
      {
        type: 'h3',
        children: [{ text: 'What is Payload CMS?' }],
      },
      {
        type: 'p',
        children: [
          {
            text: 'Payload CMS is a headless CMS built with Node.js and TypeScript. It provides a powerful admin panel and flexible content management system.',
          },
        ],
      },
      {
        type: 'h3',
        children: [{ text: 'How do I install Payload CMS?' }],
      },
      {
        type: 'p',
        children: [
          { text: 'You can install Payload CMS using npm, yarn, or pnpm. Simply run: npm install payload' },
        ],
      },
      {
        type: 'h3',
        children: [{ text: 'Can I use Payload CMS with Next.js?' }],
      },
      {
        type: 'p',
        children: [
          {
            text: 'Yes! Payload CMS works great with Next.js. There are official templates and examples available on the Payload website.',
          },
        ],
      },
      {
        type: 'h3',
        children: [{ text: 'What databases does Payload CMS support?' }],
      },
      {
        type: 'p',
        children: [
          {
            text: 'Payload CMS supports PostgreSQL, MongoDB, and SQLite out of the box. You can choose the database that best fits your needs.',
          },
        ],
      },
      // Conclusion
      {
        type: 'h2',
        children: [{ text: 'Conclusion' }],
      },
      {
        type: 'p',
        children: [{ text: 'This is the conclusion of the blog post.' }],
      },
      // Divider
      { type: 'hr', children: [{ text: '' }] },
      // Alternative FAQ
      {
        type: 'h2',
        children: [{ text: 'Alternative FAQ Format' }],
      },
      {
        type: 'p',
        children: [{ text: 'You can also use these formats:' }],
      },
      {
        type: 'h3',
        children: [{ text: 'Frequently Asked Questions' }],
      },
      {
        type: 'p',
        children: [{ text: 'Q: What is the pricing?' }],
      },
      {
        type: 'p',
        children: [{ text: 'A: Our pricing starts at $9.99 per month for the basic plan.' }],
      },
      {
        type: 'p',
        children: [{ text: 'Q: Do you offer a free trial?' }],
      },
      {
        type: 'p',
        children: [
          { text: 'A: Yes, we offer a 14-day free trial with full access to all features.' },
        ],
      },
      {
        type: 'h3',
        children: [{ text: 'Questions and Answers' }],
      },
      {
        type: 'p',
        children: [{ text: '1. How do I cancel my subscription?' }],
      },
      {
        type: 'p',
        children: [
          {
            text: 'You can cancel your subscription at any time from your account settings.',
          },
        ],
      },
      {
        type: 'p',
        children: [{ text: '2. Can I upgrade my plan?' }],
      },
      {
        type: 'p',
        children: [
          {
            text: 'Yes, you can upgrade or downgrade your plan at any time.',
          },
        ],
      },
    ]

    const lexicalContent = convertToLexical(richTextNodes)

    // Get the user ID from the token (user ID is 1 based on the token payload)
    const userId = 1

    console.log('Creating post via REST API...')
    const postData = {
      title: 'ChatGptBetterThanCursor',
      slug: 'chatgptbetterthancursor',
      _status: 'published',
      authors: [userId],
      content: lexicalContent,
      meta: {
        title: 'ChatGptBetterThanCursor',
        description: 'This is the introduction paragraph of my blog post. Here I explain what the post is about.',
      },
    }

    const response = await axios.post(`${API_URL}/posts`, postData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${PAYLOAD_TOKEN}`,
      },
    })

    const post = response.data.doc || response.data

    console.log('✅ Post created successfully!')
    console.log('Post ID:', post.id)
    console.log('Post Title:', post.title)
    console.log('Post Slug:', post.slug)
    console.log('Post URL:', `${API_URL.replace('/api', '')}/posts/${post.slug}`)

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error creating post:')
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', JSON.stringify(error.response.data, null, 2))
    } else if (error.request) {
      console.error('No response received:', error.message)
      console.error('Make sure your Payload CMS server is running at:', API_URL)
    } else {
      console.error('Error:', error.message)
    }
    process.exit(1)
  }
}

createTestPost()

