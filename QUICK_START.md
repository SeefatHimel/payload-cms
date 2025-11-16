# Google Docs Importer - Quick Start Guide

## ✅ Setup Complete!

The Google OAuth environment variables have been added to your `.env` file:
- ✅ `GOOGLE_CLIENT_ID`
- ✅ `GOOGLE_CLIENT_SECRET`
- ✅ `GOOGLE_REDIRECT_URL`
- ⏳ `GOOGLE_REFRESH_TOKEN` (will be set after OAuth flow)

## 🚀 Next Steps

### Step 1: Start Your Development Server

```bash
npm run dev
```

### Step 2: Complete OAuth Authentication

1. **Visit the OAuth login endpoint:**
   ```
   http://localhost:3000/api/google-oauth/login
   ```

2. **You'll be redirected to Google** - Sign in and grant permissions

3. **After redirect**, check your **terminal/console** for output like:
   ```
   === IMPORTANT: Add this to your .env file ===
   GOOGLE_REFRESH_TOKEN=1//0abc123...
   ```

4. **Copy the refresh token** and add it to your `.env` file:
   ```env
   GOOGLE_REFRESH_TOKEN=1//0abc123...
   ```

5. **Restart your dev server** to load the new token

### Step 3: Import a Google Doc

#### Option A: Using the Admin UI Component

1. Add the importer to your dashboard (optional):
   - Edit `src/components/BeforeDashboard/index.tsx`
   - Add: `import GoogleDocsImporter from '@/components/GoogleDocsImporter'`
   - Add: `<GoogleDocsImporter />` in the component

2. Or create a custom page at `src/app/(payload)/admin/import-google-doc/page.tsx`:
   ```tsx
   import GoogleDocsImporter from '@/components/GoogleDocsImporter'
   
   export default function ImportGoogleDocPage() {
     return (
       <div style={{ padding: '40px' }}>
         <GoogleDocsImporter />
       </div>
     )
   }
   ```

#### Option B: Using API Endpoint Directly

Make a POST request to `/api/import/google-doc`:

```bash
curl -X POST http://localhost:3000/api/import/google-doc \
  -H "Content-Type: application/json" \
  -H "Cookie: payload-token=YOUR_JWT_TOKEN" \
  -d '{"docId": "YOUR_GOOGLE_DOC_ID"}'
```

Or using JavaScript:

```javascript
const response = await fetch('/api/import/google-doc', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include auth cookies
  body: JSON.stringify({
    docId: 'YOUR_GOOGLE_DOC_ID'
  })
})

const result = await response.json()
console.log(result)
```

### Getting the Google Doc ID

From a Google Doc URL like:
```
https://docs.google.com/document/d/1a2b3c4d5e6f7g8h9i0j/edit
```

The Doc ID is: `1a2b3c4d5e6f7g8h9i0j`

## 📝 Example Workflow

1. ✅ Environment variables added
2. ⏳ Start server: `npm run dev`
3. ⏳ Visit: `http://localhost:3000/api/google-oauth/login`
4. ⏳ Complete OAuth flow
5. ⏳ Add refresh token to `.env`
6. ⏳ Restart server
7. ⏳ Import your first Google Doc!

## 🔍 Troubleshooting

### "No refresh token received"
- Make sure you're using `prompt=consent` (already set in code)
- Revoke access in [Google Account Settings](https://myaccount.google.com/permissions)
- Try the OAuth flow again

### "Document not found"
- Verify the Doc ID is correct
- Ensure the Google account has access to the document
- Check that OAuth scopes include `drive.readonly`

### "Failed to refresh access token"
- Verify `GOOGLE_REFRESH_TOKEN` is set in `.env`
- The token may have been revoked - complete OAuth flow again

## 📚 Full Documentation

See `GOOGLE_DOCS_IMPORT.md` for complete documentation.

