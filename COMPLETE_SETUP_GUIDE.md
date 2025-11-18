# 🚀 Complete Setup Guide: Google Docs to Payload CMS Automation

> **Everything you need to set up and deploy the Google Docs import system**

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Google OAuth Configuration](#google-oauth-configuration)
5. [AI Provider Setup](#ai-provider-setup)
6. [Google Drive API Setup](#google-drive-api-setup)
7. [Using the System](#using-the-system)
8. [Deployment to Render.com](#deployment-to-rendercom)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

This system automatically imports Google Docs into Payload CMS with AI-powered content enhancement. It features:

- ✅ **One-click import** from Google Docs
- ✅ **AI-powered formatting** (OpenAI or Google Gemini)
- ✅ **FAQ auto-detection** and conversion
- ✅ **Image extraction** and upload
- ✅ **Sync functionality** to update documents
- ✅ **Multi-provider AI** with automatic fallback

**Live Demo:** https://payload-cms-58ap.onrender.com/admin/google-docs

---

## 📦 Prerequisites

Before starting, ensure you have:

- ✅ Node.js 18.20.2+ or 20.9.0+
- ✅ PostgreSQL database (Supabase, Render, or any PostgreSQL provider)
- ✅ Google Cloud account (for Google Docs API)
- ✅ OpenAI API key OR Google Gemini API key (for AI features)
- ✅ Git repository (for deployment)

---

## 🛠️ Initial Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/SeefatHimel/payload-cms
cd payload-cms

# Install dependencies
pnpm install
```

### Step 2: Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URI=postgresql://user:password@host:port/database

# Payload CMS
PAYLOAD_SECRET=your-secret-key-here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Google OAuth (see next section)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URL=http://localhost:3000/api/google-oauth/callback
GOOGLE_REFRESH_TOKEN=will-be-set-after-oauth

# AI Provider (choose one or both)
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4o-mini
# OR
GOOGLE_AI_API_KEY=your-google-ai-key
GOOGLE_AI_MODEL=gemini-2.0-flash-exp
```

### Step 3: Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000/admin` to access the Payload CMS admin panel.

---

## 🔐 Google OAuth Configuration

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your **Project ID** (you'll need it later)

### Step 2: Enable Required APIs

Enable these APIs in your Google Cloud project:

1. **Google Docs API**
   - Visit: https://console.cloud.google.com/apis/library/docs.googleapis.com
   - Click "ENABLE"

2. **Google Drive API** (for image extraction)
   - Visit: https://console.cloud.google.com/apis/library/drive.googleapis.com
   - Click "ENABLE"

### Step 3: Create OAuth Credentials

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Add authorized redirect URI:
   ```
   http://localhost:3000/api/google-oauth/callback
   ```
   (For production, add your production URL too)
5. Copy the **Client ID** and **Client Secret**

### Step 4: Add Credentials to .env

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URL=http://localhost:3000/api/google-oauth/callback
```

### Step 5: Complete OAuth Flow

1. **Start your dev server:**
   ```bash
   pnpm dev
   ```

2. **Visit the OAuth login endpoint:**
   ```
   http://localhost:3000/api/google-oauth/login
   ```

3. **Sign in with Google** and grant permissions

4. **After redirect**, check your **terminal/console** for output like:
   ```
   === IMPORTANT: Add this to your .env file ===
   GOOGLE_REFRESH_TOKEN=1//0abc123...
   ```

5. **Copy the refresh token** and add it to your `.env` file:
   ```env
   GOOGLE_REFRESH_TOKEN=1//0abc123...
   ```

6. **Restart your dev server** to load the new token

---

## 🤖 AI Provider Setup

### Option 1: OpenAI (Recommended)

1. **Get an OpenAI API Key:**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key

2. **Add to `.env`:**
   ```env
   OPENAI_API_KEY=sk-your-api-key-here
   OPENAI_MODEL=gpt-4o-mini  # Optional, defaults to this
   ```

**Benefits:**
- ✅ Better free tier ($5 free credit)
- ✅ More reliable
- ✅ Faster responses
- ✅ Better JSON support

### Option 2: Google Gemini

1. **Get a Google AI API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key

2. **Add to `.env`:**
   ```env
   GOOGLE_AI_API_KEY=your-google-api-key
   GOOGLE_AI_MODEL=gemini-2.0-flash-exp
   ```

### Option 3: Both (Fallback)

Set both API keys. The system will:
1. Try OpenAI first (if `OPENAI_API_KEY` is set)
2. Fall back to Google Gemini (if OpenAI fails)
3. Skip AI formatting if neither is available

```env
OPENAI_API_KEY=sk-your-openai-key
GOOGLE_AI_API_KEY=your-google-key
```

---

## 📸 Google Drive API Setup

The Google Drive API is required for extracting images from Google Docs.

### Enable Google Drive API

1. **Visit:** https://console.cloud.google.com/apis/library/drive.googleapis.com
2. **Click "ENABLE"**
3. **Wait 1-2 minutes** for activation

### Verify APIs are Enabled

Make sure both APIs are enabled:
- ✅ Google Docs API: https://console.cloud.google.com/apis/library/docs.googleapis.com
- ✅ Google Drive API: https://console.cloud.google.com/apis/library/drive.googleapis.com

**Note:** If Drive API is not enabled, the import will still work but images will be skipped.

---

## 🎨 Using the System

### Import a Google Doc

1. **Visit the management page:**
   ```
   http://localhost:3000/admin/google-docs
   ```

2. **Click "Import New Doc"** button

3. **Paste your Google Doc URL or ID:**
   - Full URL: `https://docs.google.com/document/d/YOUR_DOC_ID/edit`
   - Or just the ID: `YOUR_DOC_ID`

4. **Enable "Use AI"** checkbox (optional, for AI formatting)

5. **Click "Import Document"**

6. **Wait 10-30 seconds** for import to complete

7. **See the result:**
   - Success message with post title
   - Document appears in the table
   - Link to view the imported post

### Sync a Document

1. **Go to:** `/admin/google-docs`
2. **Find the document** in the table
3. **Click "Sync"** button
4. **Document is updated** automatically!

### View Imported Documents

The management page shows:
- ✅ **Title** - Document title
- ✅ **Doc ID** - Google Doc ID
- ✅ **Post** - Link to created Payload post
- ✅ **Status** - Active, Error, or Syncing
- ✅ **Last Synced** - Timestamp
- ✅ **Images** - Number of images imported
- ✅ **Actions** - Sync button

---

## 🚀 Deployment to Render.com

### Step 1: Prepare Your Repository

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Ensure `.env` is NOT committed** (should be in `.gitignore`)

### Step 2: Create Render Service

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Select your repository**

### Step 3: Configure Build Settings

**Build Command:**
```bash
npm install; npm run build
```

**Start Command:**
```bash
npm start
```

**Node Version:**
- Select: `18.20.2` or `20.9.0+`

### Step 4: Set Environment Variables

In Render dashboard, add all environment variables from your `.env` file:

**Required:**
- `DATABASE_URI` - Your PostgreSQL connection string
- `PAYLOAD_SECRET` - Your Payload secret
- `NEXT_PUBLIC_SERVER_URL` - Your Render URL (e.g., `https://your-app.onrender.com`)

**Google OAuth:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URL` - Update to your Render URL: `https://your-app.onrender.com/api/google-oauth/callback`
- `GOOGLE_REFRESH_TOKEN` - Copy from your local `.env`

**AI Provider:**
- `OPENAI_API_KEY` (if using OpenAI)
- `OPENAI_MODEL` (optional)
- `GOOGLE_AI_API_KEY` (if using Google Gemini)
- `GOOGLE_AI_MODEL` (optional)

### Step 5: Update Google OAuth Redirect URI

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Navigate to Credentials**
3. **Edit your OAuth 2.0 Client ID**
4. **Add authorized redirect URI:**
   ```
   https://your-app.onrender.com/api/google-oauth/callback
   ```

### Step 6: Deploy

1. **Click "Create Web Service"**
2. **Wait for build to complete** (5-10 minutes)
3. **Your app will be live!**

### Step 7: Verify Deployment

1. **Visit your Render URL:** `https://your-app.onrender.com/admin`
2. **Test Google Docs import**
3. **Check logs** in Render dashboard if issues occur

---

## 🐛 Troubleshooting

### Build Fails on Render

**Error: "cannot connect to Postgres"**

✅ **Solution:** This is normal! The build will succeed even if the database isn't available during build. Pages will be generated at runtime.

The code includes error handling to skip static generation if the database is unavailable.

### OAuth Issues

**"No refresh token received"**

✅ **Solution:**
- Make sure you're using `prompt=consent` (already set in code)
- Revoke access in [Google Account Settings](https://myaccount.google.com/permissions)
- Try the OAuth flow again

**"Failed to refresh access token"**

✅ **Solution:**
- Verify `GOOGLE_REFRESH_TOKEN` is set in environment variables
- The token may have been revoked - complete OAuth flow again
- Check that redirect URI matches exactly

### Import Issues

**"Document not found"**

✅ **Solution:**
- Verify the Doc ID is correct
- Ensure the Google account has access to the document
- Check that OAuth scopes include `drive.readonly`

**"Import failed"**

✅ **Solution:**
- Check that OAuth is set up correctly
- Verify refresh token in environment variables
- Check server logs for detailed errors
- Make sure the Google Doc is accessible to your Google account

**"Images not importing"**

✅ **Solution:**
- Enable Google Drive API in Google Cloud Console
- Wait 1-2 minutes after enabling
- Check that OAuth scopes include `drive.readonly`

### AI Provider Issues

**"No AI provider configured"**

✅ **Solution:**
- Make sure at least one API key is set (`OPENAI_API_KEY` or `GOOGLE_AI_API_KEY`)
- Restart your server after adding keys

**"OpenAI API error"**

✅ **Solution:**
- Check your API key is valid
- Check you have credits/quota available
- Try a different model (e.g., `gpt-3.5-turbo`)

**"Google Gemini quota exhausted"**

✅ **Solution:**
- Switch to OpenAI (set `OPENAI_API_KEY`)
- Or wait for quota to reset
- Or upgrade your Google Cloud billing

### Database Connection Issues

**"Connection terminated unexpectedly"**

✅ **Solution:**
- Check `DATABASE_URI` is correct
- Verify database is accessible from your network
- For Render, ensure database allows connections from Render IPs
- Check database credentials

### Performance Issues

**"Import takes a long time"**

✅ **Solution:**
- Large documents with many images may take 1-2 minutes
- This is normal - wait for it to complete
- Check the browser console for progress

---

## 📚 Additional Resources

### Key URLs

- **Admin Panel:** `/admin`
- **Google Docs Management:** `/admin/google-docs`
- **Collection View:** `/admin/collections/google-doc-imports`
- **OAuth Login:** `/api/google-oauth/login`

### API Endpoints

- `POST /api/import/google-doc` - Import a Google Doc
- `GET /api/google-doc-imports` - List all imports
- `PATCH /api/google-doc-imports/[id]` - Update import record

### Getting Google Doc ID

From a Google Doc URL like:
```
https://docs.google.com/document/d/1a2b3c4d5e6f7g8h9i0j/edit
```

The Doc ID is: `1a2b3c4d5e6f7g8h9i0j`

---

## ✅ Checklist

Before deploying, ensure:

- [ ] All environment variables are set
- [ ] Google OAuth is configured and tested
- [ ] Refresh token is obtained and added
- [ ] Google Docs API is enabled
- [ ] Google Drive API is enabled
- [ ] AI provider API key is set (OpenAI or Google Gemini)
- [ ] Database connection is working
- [ ] Local import test is successful
- [ ] Build completes without errors
- [ ] Production redirect URI is added to Google OAuth

---

## 🎉 Success!

You now have a complete Google Docs to Payload CMS automation system!

**Features:**
- ✅ One-click import from Google Docs
- ✅ AI-powered content enhancement
- ✅ FAQ auto-detection
- ✅ Image extraction and upload
- ✅ Sync functionality
- ✅ Production-ready deployment

**Next Steps:**
1. Import your first Google Doc
2. Test the sync functionality
3. Explore AI formatting options
4. Customize as needed

---

**Built with ❤️ for SpaceSoft AI Innovation Hackathon 2025**

