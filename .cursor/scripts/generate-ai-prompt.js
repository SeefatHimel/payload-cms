#!/usr/bin/env node
/**
 * Cursor script to generate AI prompt file
 * This can be run from Cursor's command palette or terminal
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Generating AI prompt file...\n');

try {
  // Run the generate script
  execSync('npm run generate:ai-prompt', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  const filePath = path.join(process.cwd(), 'AI_PROMPT_FILE.md');
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const fileSize = (stats.size / 1024).toFixed(2);
    
    console.log('\n✅ AI prompt file generated successfully!');
    console.log(`📄 File location: ${filePath}`);
    console.log(`📊 File size: ${fileSize} KB`);
    console.log('💡 You can now send this file to AI for generating Payload CMS posts');
  } else {
    console.error('❌ AI_PROMPT_FILE.md was not created');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Failed to generate AI prompt file:', error.message);
  process.exit(1);
}

