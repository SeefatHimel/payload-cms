# Google Docs → Payload CMS Automation Setup Guide

This guide will help you set up the complete automation system that imports content from Google Docs into your Payload CMS blog.

## 🎯 What This Does

- ✅ Fetches content from Google Docs
- ✅ Extracts ALL inline images
- ✅ Uploads images to Payload CMS media collection
- ✅ Uses AI to enhance content and generate SEO metadata
- ✅ Creates blog posts in Payload CMS with proper Lexical format
- ✅ Auto-generates title, slug, meta description, and tags

## 📋 Prerequisites

1. **Payload CMS Project** - Your project should be running
2. **Google Cloud Project** - With Google Docs API enabled
3. **OpenAI API Key** (Optional) - For AI content enhancement
4. **Node.js** - v18.20.2 or >=20.9.0

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
pnpm add googleapis axios form-data openai
```

### Step 2: Set Up Google Cloud Service Account

1. **Go to Google Cloud Console**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Create a new project or select an existing one

2. **Enable Google Docs API**
   - Navigate to **APIs & Services** → **Library**
   - Search for "Google Docs API"
   - Click **Enable**

3. **Create Service Account**
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **Service Account**
   - Give it a name (e.g., "docs-importer")
   - Click **Create and Continue**
   - Skip role assignment (click **Continue**)
   - Click **Done**

4. **Create and Download JSON Key**
   - Click on the service account you just created
   - Go to **Keys** tab
   - Click **Add Key** → **Create new key**
   - Select **JSON** format
   - Download the JSON file
   - **Save it as `service-account.json` in your project root**

5. **Share Google Doc with Service Account**
   - Open the Google Doc you want to import
   - Click **Share** button
   - Add the service account email (found in the JSON file as `client_email`)
   - Give it **Viewer** permission
   - Click **Send**

### Step 3: Configure Environment Variables

Add these variables to your `.env` file (or create one if it doesn't exist):

```env
# Google Docs API Configuration
# Path to your Google Service Account JSON key file
# Can be relative (e.g., ./service-account.json) or absolute path
GOOGLE_SERVICE_ACCOUNT_KEY=./service-account.json

# OpenAI API Configuration (Optional - for AI content enhancement)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Payload CMS API Configuration
# Option 1: Use API Key (JWT token) - Recommended
# Get this by logging into Payload admin and checking browser dev tools Network tab
# Or use the login endpoint to get a token
PAYLOAD_API_KEY=your_payload_jwt_token_here

# Option 2: Use Email/Password authentication (if PAYLOAD_API_KEY is not set)
PAYLOAD_EMAIL=admin@example.com
PAYLOAD_PASSWORD=your_password_here

# Payload CMS API URL
# For local development:
PAYLOAD_API_URL=http://localhost:3000/api
# For production:
# PAYLOAD_API_URL=https://yourdomain.com/api
```

### Step 4: Get Your Google Doc ID

1. Open the Google Doc you want to import
2. Look at the URL: `https://docs.google.com/document/d/DOC_ID/edit`
3. Copy the `DOC_ID` part (the long string between `/d/` and `/edit`)

Example:
```
https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                    This is your DOC_ID
```

### Step 5: Run the Import Script

**Option A: Using npm script (Recommended)**
```bash
pnpm run import:doc YOUR_GOOGLE_DOC_ID
```

**Option B: Direct node command**
```bash
node scripts/fetchDoc.js YOUR_GOOGLE_DOC_ID
```

**Example:**
```bash
pnpm run import:doc 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

## 📝 How It Works

1. **Fetches Google Doc** - Downloads the document content via Google Docs API
2. **Extracts Text** - Converts document structure to plain text
3. **Extracts Images** - Downloads all inline images from the document
4. **Uploads Images** - Uploads images to Payload CMS media collection
5. **AI Enhancement** (if OpenAI key is set):
   - Improves content structure and readability
   - Generates SEO-friendly title
   - Creates URL-friendly slug
   - Writes meta description (150-160 chars)
   - Suggests relevant tags
6. **Converts to Lexical** - Transforms content to Payload's Lexical editor format
7. **Creates Post** - Publishes the blog post in Payload CMS

## 🔧 Configuration Options

### Publishing Status

By default, posts are published immediately. To save as drafts, edit `scripts/fetchDoc.js`:

```javascript
// Line ~380, change:
_status: 'published',
// To:
_status: 'draft',
```

### OpenAI Model

Change the AI model in your `.env`:
```env
OPENAI_MODEL=gpt-4o-mini  # Fast and cheap
# or
OPENAI_MODEL=gpt-4o        # More powerful but slower
```

### Skip AI Enhancement

If you don't want AI enhancement, simply don't set `OPENAI_API_KEY`. The script will:
- Use the first line as the title
- Auto-generate a slug from the title
- Use the first 160 characters as meta description
- Use the raw content as-is

## 🐛 Troubleshooting

### Error: "Service account key file not found"
- Make sure `GOOGLE_SERVICE_ACCOUNT_KEY` points to the correct file path
- Check that the file exists and is readable

### Error: "Permission denied" or "Document not found"
- Make sure you've shared the Google Doc with the service account email
- Verify the service account email in your `service-account.json` file
- Check that the Doc ID is correct

### Error: "Authentication failed" with Payload
- Verify your `PAYLOAD_API_KEY` is valid (JWT token)
- Or check that `PAYLOAD_EMAIL` and `PAYLOAD_PASSWORD` are correct
- Make sure your Payload CMS server is running

### Error: "Failed to download image"
- Some images might be external URLs that require authentication
- The script will continue even if some images fail to download
- Check the console output for specific image errors

### Images not appearing in post
- Verify images were uploaded successfully (check console output)
- Check that the media collection is accessible
- Ensure the Payload API URL is correct

## 📚 Advanced Usage

### Batch Import Multiple Docs

Create a script to import multiple docs:

```javascript
// scripts/batchImport.js
import { exec } from 'child_process'

const docIds = [
  'DOC_ID_1',
  'DOC_ID_2',
  'DOC_ID_3',
]

for (const docId of docIds) {
  exec(`node scripts/fetchDoc.js ${docId}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error importing ${docId}:`, error)
      return
    }
    console.log(stdout)
  })
}
```

### Watch Google Drive Folder

For automatic imports when new docs are added, you can:
1. Use Google Drive API to watch for new files
2. Set up a cron job to check for new docs
3. Use Google Apps Script to trigger webhooks

### Custom Content Processing

Edit `scripts/fetchDoc.js` to add custom processing:
- Custom image transformations
- Additional metadata extraction
- Custom Lexical block insertion
- Category assignment based on content

## 🔐 Security Notes

1. **Never commit `service-account.json` to git**
   - Add it to `.gitignore`
   - Keep it secure and private

2. **Protect your API keys**
   - Don't share your `.env` file
   - Use environment variables in production
   - Rotate keys regularly

3. **Service Account Permissions**
   - Only grant "Viewer" access to Google Docs
   - Don't give unnecessary permissions

## 📖 API Reference

### Script Location
`scripts/fetchDoc.js`

### Main Function
```javascript
processGoogleDoc(docId)
```

### Environment Variables
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Path to service account JSON
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `OPENAI_MODEL` - Model to use (default: gpt-4o-mini)
- `PAYLOAD_API_KEY` - JWT token for Payload (preferred)
- `PAYLOAD_EMAIL` - Email for Payload login (alternative)
- `PAYLOAD_PASSWORD` - Password for Payload login (alternative)
- `PAYLOAD_API_URL` - Payload API endpoint (default: http://localhost:3000/api)

## ✅ Success Checklist

- [ ] Google Cloud project created
- [ ] Google Docs API enabled
- [ ] Service account created and JSON key downloaded
- [ ] Google Doc shared with service account
- [ ] `.env` file configured with all variables
- [ ] `service-account.json` placed in project root
- [ ] Payload CMS running and accessible
- [ ] Test import completed successfully

## 🎉 You're All Set!

Once everything is configured, you can import Google Docs with a single command:

```bash
pnpm run import:doc YOUR_DOC_ID
```

Your content will be automatically:
- ✅ Imported from Google Docs
- ✅ Enhanced with AI (if configured)
- ✅ Published to Payload CMS
- ✅ Ready to view on your website!

---

**Need Help?** Check the troubleshooting section or review the script comments in `scripts/fetchDoc.js`

