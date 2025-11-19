# Cursor Slash Commands

## Available Slash Commands

### `/generate-ai-prompt`

Generates the comprehensive AI prompt file containing all block schemas, collection configs, and examples.

**Usage in Cursor Chat:**
1. Type `/generate-ai-prompt` in the chat
2. Cursor AI will execute `npm run generate:ai-prompt`
3. The `AI_PROMPT_FILE.md` will be created/updated

**What it does:**
- Scans all block schemas in `src/blocks/`
- Collects collection configurations in `src/collections/`
- Gathers example files and components
- Generates `AI_PROMPT_FILE.md` (~76KB)

**Output:**
- File: `AI_PROMPT_FILE.md` in project root
- Contains: All schemas, examples, and instructions for AI

## How It Works

When you type `/generate-ai-prompt`:
1. Cursor's AI reads `.cursorrules` file
2. Recognizes the command definition
3. Executes `npm run generate:ai-prompt`
4. Reports the results

## Alternative Methods

If slash commands don't appear:
- Use Command Palette: `Ctrl+Shift+P` → "Tasks: Run Task" → "Generate AI Prompt File"
- Use Terminal: `npm run generate:ai-prompt`
- Use Script: `node .cursor/scripts/generate-ai-prompt.js`

## Troubleshooting

**Command not appearing?**
- Make sure `.cursorrules` file exists in project root
- Restart Cursor
- Check that `npm run generate:ai-prompt` works in terminal

**Command not executing?**
- Verify Node.js and npm are installed
- Check that `scripts/generate-ai-prompt-file.ts` exists
- Run manually: `npm run generate:ai-prompt`

