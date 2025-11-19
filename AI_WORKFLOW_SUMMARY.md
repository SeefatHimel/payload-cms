# AI Workflow Summary

## ✅ What We've Built

### 1. **AI Prompt File Generator** (`scripts/generate-ai-prompt-file.ts`)
   - Scans codebase for all block schemas
   - Collects collection configurations
   - Gathers example structures
   - Generates comprehensive `AI_PROMPT_FILE.md`

### 2. **Post Creation Endpoint** (`src/app/(payload)/api/create-post-from-ai/route.ts`)
   - Accepts AI-generated responses
   - Converts API response format to create format
   - Handles dependencies (authors, categories, media)
   - Creates posts with FAQ blocks

### 3. **Sample Files**
   - `sample-payload-seed-data.json` - Seed data format
   - `sample-payload-api-response.json` - API response format
   - `faq-block-structure-reference.json` - Simplified FAQ reference

## 🚀 Quick Start

### Step 1: Generate AI Prompt File
```bash
npm run generate:ai-prompt
```

This creates `AI_PROMPT_FILE.md` with all necessary information.

### Step 2: Send to AI
1. Open `AI_PROMPT_FILE.md`
2. Copy entire contents
3. Paste into ChatGPT/Claude with your prompt:
   ```
   [Paste AI_PROMPT_FILE.md contents]
   
   Generate a blog post about "Getting Started with TypeScript" 
   with 5 FAQ items using this structure.
   ```

### Step 3: Create Post from AI Response
```bash
# Save AI response to file
echo '{"aiResponse": {...}}' > ai-post.json

# Create post via API
curl -X POST http://localhost:3000/api/create-post-from-ai \
  -H "Content-Type: application/json" \
  -H "Cookie: payload-token=YOUR_TOKEN" \
  -d @ai-post.json
```

## 📁 File Structure

```
.
├── AI_PROMPT_FILE.md              # Generated - send this to AI
├── AI_PROMPT_USAGE.md             # How to use the prompt file
├── AI_WORKFLOW_SUMMARY.md         # This file
├── sample-payload-seed-data.json  # Example seed data
├── sample-payload-api-response.json # Example API response
├── faq-block-structure-reference.json # FAQ reference
├── scripts/
│   ├── generate-ai-prompt-file.ts    # Generator script
│   └── createPostFromAIResponse.ts    # Standalone script (for testing)
└── src/app/(payload)/api/
    └── create-post-from-ai/
        └── route.ts                   # API endpoint
```

## 🔄 Auto-Update Workflow

### Option 1: Manual (Current)
```bash
npm run generate:ai-prompt
```

### Option 2: Pre-commit Hook (Recommended)
Add to `.husky/pre-commit`:
```bash
npm run generate:ai-prompt
git add AI_PROMPT_FILE.md
```

### Option 3: Watch Mode (Development)
```bash
# Install nodemon if needed
npm install -D nodemon

# Add to package.json
"watch:ai-prompt": "nodemon --watch src/blocks --watch src/collections --exec 'npm run generate:ai-prompt'"
```

## 📋 Checklist

Before sending to AI:
- [ ] Run `npm run generate:ai-prompt` to update the file
- [ ] Verify `AI_PROMPT_FILE.md` exists and is recent
- [ ] Check that all block schemas are included
- [ ] Ensure examples are up to date

After AI generates response:
- [ ] Validate JSON structure
- [ ] Check FAQ blocks are properly formatted
- [ ] Verify Lexical format is correct
- [ ] Test via `/api/create-post-from-ai` endpoint

## 🎯 Key Points

1. **Always regenerate** the prompt file after schema changes
2. **Send the complete file** to AI - don't edit it
3. **Use seed data format** for creation (preferred)
4. **Test the endpoint** before production use

## 🔧 Maintenance

The script automatically:
- ✅ Finds all block configs in `src/blocks/`
- ✅ Finds all collection configs in `src/collections/`
- ✅ Includes example files
- ✅ Includes field utilities
- ✅ Includes frontend components
- ✅ Updates timestamp

## 📝 Example AI Prompt

```
Here is the complete context for generating Payload CMS posts:

[Paste entire AI_PROMPT_FILE.md contents]

Now generate:
- A blog post about "Advanced TypeScript Patterns"
- Include 6 FAQ items about TypeScript
- Use proper Lexical format for all richText fields
- Follow the exact structure from the examples
```

## 🎉 Success!

You now have:
- ✅ Automated prompt file generation
- ✅ Complete schema documentation
- ✅ Working API endpoint
- ✅ Example structures
- ✅ Clear workflow

Just run `npm run generate:ai-prompt` whenever you make changes, and you're ready to generate posts with AI!

