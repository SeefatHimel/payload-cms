# How to Use Google Docs Importer in the UI

## 🎯 Quick Start

### Option 1: Import Page (Easiest!)

1. **Visit the import page:**
   ```
   http://localhost:3000/admin/import-google-doc
   ```

2. **Paste your Google Doc URL or ID:**
   - Full URL: `https://docs.google.com/document/d/YOUR_DOC_ID/edit`
   - Or just the ID: `YOUR_DOC_ID`

3. **Click "Import Document"**

4. **Done!** The document will be imported and saved automatically.

### Option 2: Management Page (View & Sync)

1. **Visit the management page:**
   ```
   http://localhost:3000/admin/google-docs
   ```

2. **View all imported documents** in a table

3. **Click "Sync"** to update any document

## 📋 Step-by-Step Guide

### Step 1: Access the Import Page

**URL**: `http://localhost:3000/admin/import-google-doc`

You'll see:
- A form to paste your Google Doc URL or ID
- An "Authenticate with Google" button (if needed)
- Import button

### Step 2: Authenticate (First Time Only)

If you haven't authenticated yet:

1. Click **"Authenticate with Google"**
2. You'll be redirected to Google
3. Sign in and grant permissions
4. You'll be redirected back
5. **Important**: Check your terminal for the refresh token
6. Add it to your `.env` file as `GOOGLE_REFRESH_TOKEN=...`
7. Restart your server

### Step 3: Import a Document

1. **Get your Google Doc URL:**
   - Open your Google Doc
   - Copy the URL from the address bar
   - Example: `https://docs.google.com/document/d/1a2b3c4d5e6f7g8h9i0j/edit`

2. **Paste it in the input field:**
   - You can paste the full URL OR just the Doc ID
   - The system will automatically extract the ID

3. **Click "Import Document"**

4. **Wait for import** (may take 10-30 seconds for large docs)

5. **See the result:**
   - Success message with post title
   - Links to view the post or manage imports
   - Image count

### Step 4: View & Manage Imports

1. **Visit**: `http://localhost:3000/admin/google-docs`

2. **See all imported documents** in a table showing:
   - Title
   - Doc ID
   - Linked Post (clickable)
   - Status (Active/Error/Syncing)
   - Last Synced time
   - Number of images

3. **Sync a document:**
   - Click the **"Sync"** button next to any document
   - It will re-import and update the post
   - Status will show "Syncing..." then "Active"

## 🎨 UI Features

### Import Page (`/admin/import-google-doc`)

- ✅ **Simple form** - Just paste and click
- ✅ **URL or ID support** - Accepts both formats
- ✅ **Auto-extraction** - Automatically extracts ID from URLs
- ✅ **Error handling** - Clear error messages
- ✅ **Success feedback** - Shows what was imported
- ✅ **Quick links** - Direct links to view post or manage imports

### Management Page (`/admin/google-docs`)

- ✅ **Table view** - All imports in one place
- ✅ **Status indicators** - Color-coded status badges
- ✅ **Sync button** - One-click re-import
- ✅ **Post links** - Direct access to imported posts
- ✅ **Refresh button** - Reload the list
- ✅ **Empty state** - Helpful message when no imports

## 🔗 Navigation

### From Payload Admin Dashboard:

1. Go to: `http://localhost:3000/admin`
2. You can:
   - Visit `/admin/import-google-doc` directly (type in address bar)
   - Visit `/admin/google-docs` to manage imports
   - Or access via the collections menu: "Google Doc Imports"

### Quick Links:

- **Import New Doc**: `/admin/import-google-doc`
- **Manage Imports**: `/admin/google-docs`
- **View Collection**: `/admin/collections/google-doc-imports`

## 💡 Tips

### Using Full URLs:
- Just copy-paste the entire Google Doc URL
- No need to extract the ID manually
- Works with or without `/edit` at the end

### Syncing Documents:
- Edit your Google Doc
- Go to `/admin/google-docs`
- Click "Sync" on that document
- Changes are automatically imported!

### Multiple Imports:
- Import as many documents as you want
- All are tracked in the management page
- Each can be synced independently

## 🐛 Troubleshooting

### "Please authenticate with Google"
- Click the "Authenticate with Google" button
- Complete the OAuth flow
- Add refresh token to `.env`
- Restart server

### "Invalid Google Doc URL or ID"
- Make sure you're pasting a valid Google Doc URL or ID
- Check that the document is accessible
- Try copying the URL again from your browser

### "Import failed"
- Check that OAuth is set up correctly
- Verify refresh token in `.env`
- Check server logs for detailed errors
- Make sure the Google Doc is accessible to your Google account

### Import takes a long time
- Large documents with many images may take 1-2 minutes
- This is normal - wait for it to complete
- Check the browser console for progress

## 📸 Example Workflow

1. **Open Google Doc**: `https://docs.google.com/document/d/abc123.../edit`
2. **Copy the URL**
3. **Go to**: `http://localhost:3000/admin/import-google-doc`
4. **Paste URL** in the input field
5. **Click "Import Document"**
6. **Wait 10-30 seconds**
7. **See success message** with links
8. **Click "Manage Imports"** to see it in the table
9. **Edit the Google Doc** later
10. **Go to `/admin/google-docs`** and click "Sync"
11. **Document is updated!** ✨

## 🎉 That's It!

You now have a complete UI for importing and managing Google Docs. No need for Postman or API calls - just use the web interface!

