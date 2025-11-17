# AI Content Formatting with Google Gemini

This project now supports using Google Gemini AI to format and enhance content for Payload CMS.

## Setup

1. **Get a Google AI API Key:**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy the key

2. **Add to your `.env` file:**
   ```env
   GOOGLE_AI_API_KEY=your_api_key_here
   GOOGLE_AI_MODEL=gemini-2.0-flash-exp  # Optional, defaults to this
   ```

## Usage

### Option 1: During Google Docs Import

When importing a Google Doc, you can enable AI formatting by passing `useAI: true`:

```javascript
// In your import request
fetch('/api/import/google-doc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    docId: 'your-google-doc-id',
    useAI: true  // Enable AI formatting
  })
})
```

### Option 2: Direct Usage in Code

```typescript
import { formatContentWithAI, enhanceContentQuality } from '@/utilities/aiFormatter'

// Simple content enhancement
const enhanced = await enhanceContentQuality(
  'Your content here...',
  'blog post' // context
)

// Advanced formatting with options
const formatted = await formatContentWithAI(content, {
  improveStructure: true,
  enhanceReadability: true,
  fixFormatting: true,
  addSemanticTags: true
})
```

## Available Models

- `gemini-2.0-flash-exp` (default) - Fast and efficient
- `gemini-1.5-pro` - More powerful but slower
- `gemini-1.5-flash` - Balanced option

Set via `GOOGLE_AI_MODEL` environment variable.

## Features

The AI formatter can:
- ✅ Improve content structure and organization
- ✅ Enhance readability and flow
- ✅ Fix formatting inconsistencies
- ✅ Add semantic structure where appropriate
- ✅ Maintain original meaning and tone

## Example

**Before:**
```
This is some content. It needs formatting. It has issues.
```

**After AI formatting:**
```
This is some well-structured content that has been enhanced for better readability. 
The formatting issues have been resolved while maintaining the original meaning.
```

## Notes

- AI formatting is **optional** - if the API key is not set, the system will work normally without AI
- AI formatting happens **after** parsing from Google Docs but **before** saving to Payload CMS
- If AI formatting fails, the original content is used (graceful fallback)
- AI formatting adds processing time, so use it selectively

## Cost Considerations

Google Gemini API has a free tier with generous limits. Check [Google AI Studio](https://aistudio.google.com/) for current pricing.

