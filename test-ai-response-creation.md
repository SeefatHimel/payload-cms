# Testing AI Response Post Creation

This guide shows how to test creating a post from an AI-generated API response.

## Method 1: Using the API Endpoint (Recommended)

The API endpoint `/api/create-post-from-ai` accepts an AI response and creates a post.

### Step 1: Start your development server

```bash
npm run dev
# or
pnpm dev
```

### Step 2: Get an authentication token

You need to be authenticated. You can:
- Log in through the admin panel at `/admin`
- Or use an existing session cookie

### Step 3: Call the API endpoint

```bash
curl -X POST http://localhost:3000/api/create-post-from-ai \
  -H "Content-Type: application/json" \
  -H "Cookie: payload-token=YOUR_TOKEN" \
  -d @sample-payload-api-response.json
```

Or using the sample AI response directly:

```bash
curl -X POST http://localhost:3000/api/create-post-from-ai \
  -H "Content-Type: application/json" \
  -H "Cookie: payload-token=YOUR_TOKEN" \
  -d '{
    "aiResponse": {
      "title": "My AI Generated Post",
      "slug": "my-ai-generated-post",
      "_status": "published",
      "content": {
        "root": {
          "type": "root",
          "children": [
            {
              "type": "block",
              "fields": {
                "blockType": "faq",
                "title": "FAQ Section",
                "items": [
                  {
                    "question": "What is this?",
                    "answer": {
                      "root": {
                        "type": "root",
                        "children": [
                          {
                            "type": "paragraph",
                            "children": [
                              {
                                "type": "text",
                                "text": "This is an answer."
                              }
                            ]
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    }
  }'
```

## Method 2: Using the Script (Requires Environment Variables)

If you have your `.env` file set up with `PAYLOAD_SECRET` and `DATABASE_URI`:

```bash
npx tsx scripts/createPostFromAIResponse.ts
```

## What the Script Does

1. ✅ Takes the AI response (which looks like a Payload API response)
2. ✅ Converts it to the format needed for creating a post
3. ✅ Extracts IDs from populated relationships
4. ✅ Gets or creates required dependencies (author, category, media)
5. ✅ Creates or updates the post with FAQ blocks
6. ✅ Returns the created post

## Expected Output

```json
{
  "success": true,
  "post": {
    "id": 1,
    "title": "Getting Started with Payload CMS: A Complete Guide",
    "slug": "getting-started-with-payload-cms",
    "faqItems": 4
  },
  "message": "Post created successfully from AI response!"
}
```

## Testing with the Sample File

The endpoint includes a built-in sample AI response, so you can test it without sending data:

```bash
curl -X POST http://localhost:3000/api/create-post-from-ai \
  -H "Cookie: payload-token=YOUR_TOKEN"
```

This will create a post with:
- Title: "Getting Started with Payload CMS: A Complete Guide"
- 4 FAQ items
- Full content with headings and paragraphs

## View the Created Post

After creation, you can view the post at:
- Frontend: `http://localhost:3000/posts/getting-started-with-payload-cms`
- Admin: `http://localhost:3000/admin/collections/posts/{id}`

## Next Steps

1. Replace the sample AI response with actual AI-generated content
2. Modify the endpoint to accept different AI response formats
3. Add validation for AI responses
4. Add support for other block types (banner, code, etc.)

