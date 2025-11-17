# Multi-Provider AI Setup Guide

## 🎉 Great News!

You can now use **OpenAI** instead of Google Gemini! This solves your quota issues because:
- ✅ OpenAI has better free tier limits
- ✅ `openai` package is already installed in your project
- ✅ You can switch between providers easily

## Quick Setup

### Option 1: Use OpenAI (Recommended)

1. **Get an OpenAI API Key:**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key

2. **Add to your `.env` file:**
   ```env
   OPENAI_API_KEY=sk-your-api-key-here
   OPENAI_MODEL=gpt-4o-mini  # Optional, defaults to this (fast & cheap)
   ```

3. **That's it!** The system will automatically use OpenAI instead of Google Gemini.

### Option 2: Keep Using Google Gemini

Just keep your existing setup:
```env
GOOGLE_AI_API_KEY=your-google-api-key
GOOGLE_AI_MODEL=gemini-2.0-flash-exp
```

### Option 3: Use Both (Fallback)

Set both API keys. The system will:
1. Try OpenAI first (if `OPENAI_API_KEY` is set)
2. Fall back to Google Gemini (if OpenAI fails or not set)
3. Skip AI formatting if neither is available

```env
OPENAI_API_KEY=sk-your-openai-key
GOOGLE_AI_API_KEY=your-google-key
```

## Provider Priority

The system checks in this order:
1. **OpenAI** (if `OPENAI_API_KEY` is set)
2. **Google Gemini** (if `GOOGLE_AI_API_KEY` is set)
3. **None** (skips AI formatting)

## OpenAI Models

Recommended models (cheap and fast):
- `gpt-4o-mini` (default) - Best balance of speed and quality
- `gpt-3.5-turbo` - Faster, cheaper
- `gpt-4o` - Better quality, more expensive

Set via `OPENAI_MODEL` environment variable.

## Benefits of OpenAI

### vs Google Gemini Free Tier:
- ✅ **Better free tier** - $5 free credit (usually lasts longer)
- ✅ **More reliable** - Less quota exhaustion
- ✅ **Better JSON support** - Native JSON mode
- ✅ **Faster responses** - Usually quicker than Gemini

### Cost Comparison:
- **OpenAI gpt-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **Google Gemini free tier**: Very limited, often exhausted

## Usage

No code changes needed! The system automatically:
- Detects which provider is available
- Uses the best one
- Falls back gracefully if one fails

Just set your API keys and import documents as usual.

## Testing

1. Set `OPENAI_API_KEY` in your `.env`
2. Import a Google Doc with `useAI: true`
3. Check logs - you should see:
   ```
   [AI Provider] 🤖 Using OpenAI (gpt-4o-mini)...
   [AI Provider] ✅ Content formatted with OpenAI successfully!
   ```

## Troubleshooting

### "No AI provider configured"
- Make sure at least one API key is set in `.env`
- Restart your dev server after adding keys

### "OpenAI API error"
- Check your API key is valid
- Check you have credits/quota available
- Try a different model (e.g., `gpt-3.5-turbo`)

### Still using Google Gemini?
- Remove `GOOGLE_AI_API_KEY` if you want to force OpenAI
- Or set `OPENAI_API_KEY` (it takes priority)

## Migration from Google Gemini

1. Get OpenAI API key
2. Add `OPENAI_API_KEY` to `.env`
3. Optionally remove `GOOGLE_AI_API_KEY` (or keep as fallback)
4. Restart server
5. Done! System now uses OpenAI

No code changes needed - it's automatic! 🎉

