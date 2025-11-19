#!/bin/bash
# Cursor script to generate AI prompt file
# This script can be run from Cursor's command palette

echo "🚀 Generating AI prompt file..."
npm run generate:ai-prompt

if [ $? -eq 0 ]; then
    echo "✅ AI prompt file generated successfully!"
    echo "📄 File location: AI_PROMPT_FILE.md"
    echo "💡 You can now send this file to AI for generating Payload CMS posts"
else
    echo "❌ Failed to generate AI prompt file"
    exit 1
fi

