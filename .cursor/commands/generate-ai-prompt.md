# Generate AI Prompt File

Generate the comprehensive AI prompt file containing all block schemas, collection configs, and examples for AI to generate Payload CMS posts.

## Command

```bash
npm run generate:ai-prompt
```

## What it does

- Scans all block schemas in `src/blocks/`
- Collects collection configurations in `src/collections/`
- Gathers example files and components
- Generates `AI_PROMPT_FILE.md` with all necessary information

## Output

Creates/updates `AI_PROMPT_FILE.md` in the project root (~76KB file)

## Usage

Run this command whenever you:
- Add or modify block schemas
- Change collection configurations
- Update field structures
- Need to send updated context to AI

