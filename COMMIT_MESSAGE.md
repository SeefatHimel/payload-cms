# Suggested Commit Message

```
feat: Add multi-provider AI system with OpenAI and Google Gemini support

## Major Features
- Multi-provider AI system supporting OpenAI and Google Gemini
- Automatic provider detection (OpenAI preferred, Google Gemini fallback)
- Batch FAQ formatting (reduces API calls from 12+ to 1)
- FAQ auto-detection from Google Docs
- Enhanced error handling and quota management

## New Files
- src/utilities/aiProvider.ts - Multi-provider AI system
- src/utilities/faqParser.ts - FAQ auto-detection parser
- src/blocks/FAQ/ - FAQ block component and config
- src/components/ui/accordion.tsx - Accordion UI component
- Documentation files for setup and troubleshooting

## Updated Files
- src/utilities/aiFormatter.ts - Integrated with provider system
- src/app/(payload)/api/import/google-doc/route.ts - Dynamic provider logging
- src/components/GoogleDocImportsList/index.tsx - Sync with AI preference
- src/payload.config.ts - Database connection improvements
- src/app/(frontend)/posts/[slug]/page.tsx - Timeout improvements

## Improvements
- Reduced API calls for FAQ formatting (12+ → 1)
- Better quota management and error handling
- Dynamic provider detection and logging
- FAQ auto-detection from Google Docs content
- Support for both OpenAI and Google Gemini

## Environment Variables
- OPENAI_API_KEY (optional, preferred)
- GOOGLE_AI_API_KEY (optional, fallback)
- OPENAI_MODEL (optional, default: gpt-4o-mini)
- GOOGLE_AI_MODEL (optional, default: gemini-2.0-flash-exp)

## Breaking Changes
None - Fully backward compatible
```

