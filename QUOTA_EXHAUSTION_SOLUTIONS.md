# Google AI API Quota Exhaustion - Solutions

## Problem
You're seeing errors like:
```
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_input_token_count, limit: 0
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 0
```

This means your **free tier quota is completely exhausted** (`limit: 0`).

## What We've Implemented

### 1. **Smart Quota Detection**
- The system now detects when quota is exhausted (`limit: 0`)
- Tracks when quota might reset (extracts from error message)
- Automatically skips AI formatting if quota is exhausted
- **Imports still work** - they just use original content without AI enhancement

### 2. **Quota State Tracking**
- Remembers quota exhaustion state (until server restart)
- Shows estimated time until quota resets
- Automatically retries when quota reset time passes

### 3. **Graceful Degradation**
- If AI fails, import continues with original content
- No failed imports due to quota issues
- Clear error messages in logs

## Solutions

### ✅ **Solution 1: Wait for Quota Reset (Recommended for Free Tier)**
- Free tier quotas usually reset **every hour** or **daily**
- Check your [Google AI Console](https://ai.dev/usage?tab=rate-limit) for exact reset times
- The system will automatically retry when quota resets

### ✅ **Solution 2: Disable AI Formatting**
**Option A: Per-Import**
- Uncheck the "Use AI Formatting" checkbox when importing
- Content will be imported without AI enhancement

**Option B: Per-Document**
- In the Google Docs imports table, uncheck "Use AI" for specific documents
- Sync will use original content

**Option C: Globally**
- Remove or don't set `GOOGLE_AI_API_KEY` in your environment variables
- All imports will skip AI formatting

### ✅ **Solution 3: Upgrade Your Google AI API Plan**
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Navigate to **Settings** → **API Keys** → **Quotas**
3. Upgrade to a paid plan for higher limits
4. Free tier has very limited quotas (often 0 after initial usage)

### ✅ **Solution 4: Use a Different Model**
- Try a different model that might have different quota limits
- Set `GOOGLE_AI_MODEL` environment variable to:
  - `gemini-1.5-flash` (might have different limits)
  - `gemini-1.5-pro` (paid tier only)
- Check [Google AI Model List](https://ai.google.dev/models) for available models

## How It Works Now

### When Quota is Exhausted:
1. ✅ System detects `limit: 0` error
2. ✅ Logs clear error message with solutions
3. ✅ Tracks reset time from error message
4. ✅ Skips all subsequent AI calls
5. ✅ **Import continues successfully** with original content
6. ✅ Automatically retries when quota resets

### Log Messages You'll See:
```
[AI Formatter] ❌ Quota completely exhausted. Free tier limit reached.
[AI Formatter] ⏰ Quota may reset in ~55 minutes (or check your Google AI Console)
[AI Formatter] 💡 Solutions:
[AI Formatter]    1. Wait for quota to reset (usually 1 hour for free tier)
[AI Formatter]    2. Upgrade your Google AI API plan
[AI Formatter]    3. Disable AI formatting (set useAI: false)
[AI Formatter]    4. Import without AI formatting enabled
[Import] ⚠️ AI quota exhausted. FAQ content imported without AI formatting.
```

## Best Practices

1. **For Development**: Disable AI formatting to avoid quota issues
2. **For Production**: Upgrade to a paid plan or use AI selectively
3. **For Testing**: Import without AI first, then enable AI for final polish
4. **Monitor Usage**: Check [Google AI Console](https://ai.dev/usage) regularly

## FAQ

**Q: Will my imports fail if quota is exhausted?**  
A: No! Imports will succeed using original content from Google Docs.

**Q: How long until quota resets?**  
A: Usually 1 hour for free tier, but check your Google AI Console for exact times.

**Q: Can I use AI for some imports but not others?**  
A: Yes! Use the "Use AI" checkbox per document in the imports table.

**Q: Will the system automatically retry when quota resets?**  
A: Yes, on the next import attempt after the reset time.

**Q: How do I check my current quota status?**  
A: Visit [Google AI Console Usage](https://ai.dev/usage?tab=rate-limit)

