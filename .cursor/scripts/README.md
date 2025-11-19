# Cursor Scripts

These scripts can be run from Cursor's command palette or terminal.

## Available Scripts

### Generate AI Prompt File

**Purpose:** Generates the comprehensive AI prompt file (`AI_PROMPT_FILE.md`) containing all block schemas, collection configs, and examples.

**How to run in Cursor:**
1. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type "Run Script" or "Terminal: Run Task"
3. Select the script you want to run

**Or run directly:**
- **Windows (PowerShell):** `.cursor/scripts/generate-ai-prompt.ps1`
- **Mac/Linux (Bash):** `.cursor/scripts/generate-ai-prompt.sh`
- **Node.js (Cross-platform):** `node .cursor/scripts/generate-ai-prompt.js`

**Or use npm:**
```bash
npm run generate:ai-prompt
```

## Adding to Cursor Tasks

You can also add these to `.vscode/tasks.json` for easier access:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Generate AI Prompt File",
      "type": "shell",
      "command": "npm run generate:ai-prompt",
      "problemMatcher": []
    }
  ]
}
```

Then run via: `Ctrl+Shift+P` → "Tasks: Run Task" → "Generate AI Prompt File"

