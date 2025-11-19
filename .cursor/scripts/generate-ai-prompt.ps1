# Cursor script to generate AI prompt file (PowerShell version for Windows)
# This script can be run from Cursor's command palette

Write-Host "🚀 Generating AI prompt file..." -ForegroundColor Cyan

npm run generate:ai-prompt

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ AI prompt file generated successfully!" -ForegroundColor Green
    Write-Host "📄 File location: AI_PROMPT_FILE.md" -ForegroundColor Yellow
    Write-Host "💡 You can now send this file to AI for generating Payload CMS posts" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to generate AI prompt file" -ForegroundColor Red
    exit 1
}

