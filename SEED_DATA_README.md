# Payload CMS Seed Data Files

This directory contains sample seed data files that demonstrate how to create Payload CMS posts with FAQ blocks and other content blocks.

## Files Overview

### 1. `sample-payload-seed-data.json`
Complete JSON example showing a full post structure with FAQ blocks embedded in the richText content. This is the format that an AI agent would generate.

**Use Case**: Pass this to ChatGPT/Claude to show the exact structure needed for generating Payload CMS compatible seed data.

### 2. `sample-payload-seed-data.ts`
TypeScript version with helper functions that can be used directly in seed scripts.

**Use Case**: Import and use in your actual Payload CMS seed scripts.

### 3. `faq-block-structure-reference.json`
Simplified reference showing just the FAQ block structure in isolation.

**Use Case**: Quick reference for understanding the FAQ block format without the full post structure.

### 4. `payload-blocks.json`
Complete schema documentation of all blocks and RichText configurations in the codebase.

**Use Case**: Reference for understanding all available blocks and their field structures.

## How to Use with AI Agents

### Step 1: Provide Context
Share these files with your AI agent (ChatGPT, Claude, etc.) along with instructions like:

```
"Generate Payload CMS seed data for a blog post about [TOPIC]. 
Use the FAQ block structure from the reference files. 
Include at least 3-5 FAQ items relevant to the topic."
```

### Step 2: AI Generates Response
The AI will generate JSON or TypeScript code following the structure in `sample-payload-seed-data.json`.

### Step 3: Use the Generated Data
1. Save the AI's response to a file (e.g., `generated-post.json` or `generated-post.ts`)
2. Replace placeholders:
   - `{{MEDIA_ID}}` → Actual media document ID
   - `{{USER_ID}}` → Actual user document ID
   - `{{CATEGORY_ID}}` → Actual category document ID
3. Use in your seed script or API

## FAQ Block Structure

The FAQ block must be embedded within the `content` field's Lexical editor state:

```json
{
  "type": "block",
  "fields": {
    "blockType": "faq",
    "title": "Optional FAQ Section Title",
    "items": [
      {
        "question": "Required question text",
        "answer": {
          "root": {
            "type": "root",
            "children": [
              {
                "type": "paragraph",
                "children": [
                  {
                    "type": "text",
                    "text": "Answer content"
                  }
                ]
              }
            ]
          }
        }
      }
    ]
  },
  "version": 2
}
```

## Example Usage in Seed Script

```typescript
import { createPostWithFAQ } from './sample-payload-seed-data'

// In your seed function
const post = createPostWithFAQ({
  heroImage: imageDoc,
  author: userDoc,
  category: categoryDoc
})

await payload.create({
  collection: 'posts',
  data: post
})
```

## Key Points

1. **Blocks are embedded in richText**: FAQ blocks (and other blocks) are inserted as `type: 'block'` nodes within the Lexical editor's content tree.

2. **Lexical format required**: The `answer` field in FAQ items must be in Lexical editor format, not plain text.

3. **Block type must match**: The `blockType` field must exactly match the block's slug (e.g., `'faq'` for FAQ blocks).

4. **Required fields**: 
   - `items` array is required and must have at least one item
   - Each item must have `question` (text) and `answer` (Lexical format)

5. **Optional fields**:
   - `title` - Optional FAQ section title

## Testing

After generating seed data, you can test it by:

1. Using Payload's API to create a post
2. Checking the admin panel to verify the FAQ block renders correctly
3. Viewing the frontend to ensure the FAQ accordion displays properly

## Next Steps

Once you have working seed data generation:
1. Create a script that takes AI-generated content and formats it into Payload CMS structure
2. Automate the process of creating posts from AI-generated content
3. Build a pipeline that converts markdown or other formats into Payload CMS blocks

