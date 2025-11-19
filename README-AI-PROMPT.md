# Auto-Generate AI Prompt for Blocks

## 🎯 Purpose

This script automatically generates and updates the AI prompt in `src/utilities/aiFormatter.ts` based on your Payload CMS block definitions. **No more manual prompt updates!**

## 🚀 Usage

Whenever you add a new block or modify existing blocks, simply run:

```bash
pnpm run update:ai-prompt
```

The script will:
1. ✅ Read all block definitions from `payload-blocks.json`
2. ✅ Generate prompt instructions for each block
3. ✅ Update the AI prompt in `aiFormatter.ts` automatically
4. ✅ Include block structures and formatting rules

## 📋 What Gets Updated

The script updates the **"BLOCK MARKERS & FORMATTING"** and **"PAYLOAD CMS BLOCK STRUCTURES"** sections in the AI prompt, including:

- Block marker instructions (e.g., `##FAQ`, `##BANNER`, `##CODE`)
- Formatting rules for each block type
- Block structure definitions
- Special handling for FAQ blocks (with examples)

## 🔧 How It Works

1. **Reads** `payload-blocks.json` to get all block definitions
2. **Filters** content blocks (FAQ, Banner, Code, Media, CTA, Content)
3. **Generates** prompt sections for each block
4. **Updates** `src/utilities/aiFormatter.ts` automatically

## ✨ Features

- ✅ **Automatic**: No manual editing needed
- ✅ **Complete**: Includes all block structures
- ✅ **Smart**: Special handling for FAQ blocks with examples
- ✅ **Safe**: Only updates the prompt section, preserves other code

## 📝 Example

After adding a new block called "Testimonial":

1. Define it in `src/blocks/Testimonial/config.ts`
2. Run `pnpm run update:ai-prompt`
3. The prompt now includes:
   - `##TESTIMONIAL` marker instructions
   - Testimonial block structure
   - Formatting rules

## 🎨 Supported Blocks

Currently includes:
- ✅ FAQ (`##FAQ`)
- ✅ Banner (`##BANNER`)
- ✅ Code (`##CODE`)
- ✅ Media (`##MEDIABLOCK`)
- ✅ Call to Action (`##CTA`)
- ✅ Content (`##CONTENT`)

## 🔄 Workflow

```
Add/Modify Block → Run Script → AI Prompt Updated → Ready to Use!
```

## 💡 Tips

- Run the script after adding new blocks
- Run the script after modifying block structures
- The script preserves your custom instructions (like FAQ examples)
- Check the console output to see which blocks were included

---

**Script Location:** `scripts/generate-ai-prompt.ts`  
**Updated File:** `src/utilities/aiFormatter.ts`

