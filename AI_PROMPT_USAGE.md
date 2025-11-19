# AI Prompt File Usage Guide

## Overview

The `AI_PROMPT_FILE.md` is a comprehensive file that contains all the information needed for AI to generate Payload CMS posts with blocks (especially FAQ blocks).

## Generating the File

### Manual Generation

```bash
npm run generate:ai-prompt
# or
pnpm generate:ai-prompt
# or
npx tsx scripts/generate-ai-prompt-file.ts
```

### When to Regenerate

Regenerate the file whenever you:
- Add or modify block schemas
- Change collection configurations
- Update field structures
- Modify example files
- Change component structures

## Using with AI

### Step 1: Generate the Prompt File

```bash
npm run generate:ai-prompt
```

### Step 2: Copy the File Contents

Open `AI_PROMPT_FILE.md` and copy its contents.

### Step 3: Send to AI

Paste the file contents along with your prompt:

```
Here is the complete context for generating Payload CMS posts:

[Paste AI_PROMPT_FILE.md contents here]

Now generate a blog post about "Getting Started with React" 
with 5 FAQ items using the structure provided.
```

### Step 4: Use the Generated Response

The AI will generate a JSON structure that you can:
1. Save to a file
2. Send to `/api/create-post-from-ai` endpoint
3. Use in seed scripts

## Example Workflow

```bash
# 1. Generate the prompt file
npm run generate:ai-prompt

# 2. Copy AI_PROMPT_FILE.md contents and send to ChatGPT/Claude

# 3. Get the AI response (JSON)

# 4. Save it to a file
echo '{"aiResponse": {...}}' > ai-generated-post.json

# 5. Create the post via API
curl -X POST http://localhost:3000/api/create-post-from-ai \
  -H "Content-Type: application/json" \
  -H "Cookie: payload-token=YOUR_TOKEN" \
  -d @ai-generated-post.json
```

## Auto-Update Options

### Option 1: Pre-commit Hook (Recommended)

Add to `.husky/pre-commit` or similar:

```bash
#!/bin/sh
npm run generate:ai-prompt
git add AI_PROMPT_FILE.md
```

### Option 2: Watch Mode (Development)

Create a watch script:

```json
{
  "scripts": {
    "watch:ai-prompt": "nodemon --watch src/blocks --watch src/collections --exec 'npm run generate:ai-prompt'"
  }
}
```

### Option 3: CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Generate AI Prompt File
  run: npm run generate:ai-prompt
```

## File Structure

The generated `AI_PROMPT_FILE.md` includes:

1. **Instructions for AI** - Clear guidelines on what to generate
2. **Block Schemas** - All block configurations (FAQ, Banner, Code, etc.)
3. **Collection Schemas** - Posts collection and others
4. **Field Utilities** - Link, linkGroup, defaultLexical
5. **Example Structures** - Seed data and API response formats
6. **Frontend Components** - How blocks are rendered
7. **Validation Checklist** - What to check before generating

## Tips

1. **Always regenerate** before sending to AI if you've made schema changes
2. **Include the full file** - Don't edit it, let AI see everything
3. **Be specific** - Ask for exact number of FAQ items, topics, etc.
4. **Test the output** - Use the `/api/create-post-from-ai` endpoint to validate

## Troubleshooting

### File not generating
- Check that all source files exist
- Verify TypeScript compilation works
- Check file permissions

### AI generates incorrect structure
- Regenerate the prompt file
- Ensure you're sending the complete file
- Check that examples match your current schema

### Posts not creating
- Validate the JSON structure
- Check that FAQ blocks are in the correct format
- Verify Lexical editor format is correct

## Next Steps

1. Set up auto-regeneration (pre-commit hook recommended)
2. Create templates for common AI prompts
3. Build a validation script for AI-generated content
4. Integrate with your AI workflow

