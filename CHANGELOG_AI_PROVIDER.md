# AI Provider System - Changelog

## Summary
Implemented a multi-provider AI system that supports both OpenAI and Google Gemini, with automatic provider detection and fallback.

## Changes Made

### 1. New Multi-Provider System
- **File**: `src/utilities/aiProvider.ts` (NEW)
- **Features**:
  - Automatic provider detection (OpenAI first, then Google Gemini)
  - Unified API for both providers
  - Batch FAQ formatting support
  - Graceful error handling

### 2. Updated AI Formatter
- **File**: `src/utilities/aiFormatter.ts`
- **Changes**:
  - Integrated with multi-provider system
  - Removed hardcoded Google Gemini dependencies
  - Uses `formatWithProvider()` and `batchFormatFAQsWithAI()` from provider system
  - Simplified error handling

### 3. Updated Import Route
- **File**: `src/app/(payload)/api/import/google-doc/route.ts`
- **Changes**:
  - Dynamic provider detection and logging
  - Shows actual provider being used (OpenAI/Google Gemini)
  - Better AI configuration logging
  - Updated to use provider system

### 4. Updated Sync Route
- **File**: `src/components/GoogleDocImportsList/index.tsx`
- **Changes**:
  - Sync now respects `useAI` preference from import record
  - Passes `useAI` parameter to import API

### 5. Documentation
- **Files**: 
  - `AI_PROVIDER_SETUP.md` - Setup guide
  - `SWITCH_TO_OPENAI.md` - Quick switch guide
  - `OPENAI_SETUP_COMPLETE.md` - Setup completion guide
  - `RESTART_SERVER.md` - Server restart instructions
  - `QUOTA_EXHAUSTION_SOLUTIONS.md` - Quota troubleshooting
  - `WHY_RATE_LIMITS.md` - Rate limit explanation
  - `AI_CALL_ANALYSIS.md` - AI call analysis

## Environment Variables

### Required (at least one):
- `OPENAI_API_KEY` - OpenAI API key (preferred)
- `GOOGLE_AI_API_KEY` - Google Gemini API key (fallback)

### Optional:
- `OPENAI_MODEL` - OpenAI model (default: `gpt-4o-mini`)
- `GOOGLE_AI_MODEL` - Google Gemini model (default: `gemini-2.0-flash-exp`)

## Provider Priority

1. **OpenAI** (if `OPENAI_API_KEY` is set)
2. **Google Gemini** (if `GOOGLE_AI_API_KEY` is set and OpenAI not available)
3. **None** (skips AI formatting)

## Benefits

✅ **No more quota exhaustion** - Can switch between providers  
✅ **Better reliability** - Automatic fallback  
✅ **Flexible** - Easy to add more providers  
✅ **Better logging** - Shows which provider is being used  
✅ **Batch formatting** - Reduced API calls (12+ → 1 for FAQs)  

## Breaking Changes

None - Fully backward compatible. Existing Google Gemini setup continues to work.

## Migration

No migration needed. Just add `OPENAI_API_KEY` to `.env` to use OpenAI, or keep using Google Gemini.

## Testing

1. Set `OPENAI_API_KEY` in `.env`
2. Restart server
3. Import document with `useAI: true`
4. Check logs for: `[AI Provider] 🤖 Using OpenAI...`

## Notes

- `.env` file should be in `.gitignore` (contains API keys)
- Server must be restarted after adding new env vars
- Both providers can be set for automatic fallback

