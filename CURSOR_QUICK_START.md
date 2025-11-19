# Cursor Quick Start - AI Prompt Generation

## 🚀 Quick Ways to Generate AI Prompt File

### Method 1: Using Cursor Tasks (Easiest)

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type: `Tasks: Run Task`
3. Select: **"Generate AI Prompt File"**
4. Done! ✅

### Method 2: Using Terminal in Cursor

1. Open terminal in Cursor (`Ctrl+`` ` or `View → Terminal`)
2. Run:
   ```bash
   npm run generate:ai-prompt
   ```

### Method 3: Using the Script Directly

**Windows (PowerShell):**
```powershell
.cursor/scripts/generate-ai-prompt.ps1
```

**Mac/Linux:**
```bash
.cursor/scripts/generate-ai-prompt.sh
```

**Cross-platform (Node.js):**
```bash
node .cursor/scripts/generate-ai-prompt.js
```

## 📋 What It Does

The script:
- ✅ Scans all block schemas (`src/blocks/`)
- ✅ Collects collection configs (`src/collections/`)
- ✅ Gathers example files
- ✅ Generates `AI_PROMPT_FILE.md` (76KB+ file)

## 💡 Using the Generated File

1. Open `AI_PROMPT_FILE.md`
2. Copy entire contents
3. Paste into ChatGPT/Claude with your prompt:
   ```
   [Paste AI_PROMPT_FILE.md contents]
   
   Generate a blog post about "TypeScript Best Practices" 
   with 5 FAQ items.
   ```

## 🔄 When to Regenerate

Run the script whenever you:
- Add/modify block schemas
- Change collection configurations
- Update field structures
- Modify example files

## ⚡ Keyboard Shortcut (Optional)

Add to Cursor keybindings (`.cursor/keybindings.json`):
```json
{
  "key": "ctrl+shift+a",
  "command": "workbench.action.tasks.runTask",
  "args": "Generate AI Prompt File"
}
```

Then just press `Ctrl+Shift+A` to generate!

## 📁 Files Created

- `AI_PROMPT_FILE.md` - The file to send to AI
- Located in project root
- ~76KB, contains all schemas and examples

## 🎯 Next Steps

After generating:
1. Send `AI_PROMPT_FILE.md` to AI
2. Get AI-generated JSON response
3. Use `/api/create-post-from-ai` endpoint to create the post

---

**Pro Tip:** Add this to your workflow - regenerate before each AI session to ensure you have the latest schemas!

