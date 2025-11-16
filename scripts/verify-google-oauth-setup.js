/**
 * Verification script for Google OAuth setup
 * Run with: node scripts/verify-google-oauth-setup.js
 */

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file
config({ path: resolve(__dirname, '../.env') })

console.log('🔍 Verifying Google OAuth Setup...\n')

const requiredVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URL',
]

const optionalVars = [
  'GOOGLE_REFRESH_TOKEN',
]

let allGood = true

// Check required variables
console.log('Required Environment Variables:')
requiredVars.forEach((varName) => {
  const value = process.env[varName]
  if (value) {
    console.log(`  ✅ ${varName}: ${value.substring(0, 20)}...`)
  } else {
    console.log(`  ❌ ${varName}: NOT SET`)
    allGood = false
  }
})

console.log('\nOptional Environment Variables:')
optionalVars.forEach((varName) => {
  const value = process.env[varName]
  if (value) {
    console.log(`  ✅ ${varName}: Set (${value.length} characters)`)
  } else {
    console.log(`  ⚠️  ${varName}: Not set (will be set after OAuth flow)`)
  }
})

console.log('\n📋 Next Steps:')
if (!process.env.GOOGLE_REFRESH_TOKEN) {
  console.log('  1. Start your development server: npm run dev')
  console.log('  2. Visit: http://localhost:3000/api/google-oauth/login')
  console.log('  3. Complete the OAuth flow')
  console.log('  4. Copy the refresh token from console output')
  console.log('  5. Add it to .env as GOOGLE_REFRESH_TOKEN=your_token_here')
} else {
  console.log('  ✅ Refresh token is set!')
  console.log('  You can now import Google Docs using:')
  console.log('  POST /api/import/google-doc with { "docId": "YOUR_DOC_ID" }')
}

if (allGood) {
  console.log('\n✅ All required environment variables are set!')
  process.exit(0)
} else {
  console.log('\n❌ Some required environment variables are missing!')
  process.exit(1)
}

