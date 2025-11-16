# How to Import a Google Doc

## ✅ Step 1: Add Refresh Token to .env

After completing OAuth, you should see output in your terminal like:

```
=== IMPORTANT: Add this to your .env file ===
GOOGLE_REFRESH_TOKEN=1//0abc123def456...
```

1. **Copy the refresh token** (the long string after `GOOGLE_REFRESH_TOKEN=`)
2. **Open your `.env` file**
3. **Find the line**: `GOOGLE_REFRESH_TOKEN=`
4. **Paste your token** after the `=`:
   ```env
   GOOGLE_REFRESH_TOKEN=1//0abc123def456...
   ```
5. **Save the file**
6. **Restart your dev server** (stop and run `npm run dev` again)

## ✅ Step 2: Get Your Google Doc ID

From a Google Doc URL like:
```
https://docs.google.com/document/d/1a2b3c4d5e6f7g8h9i0j/edit
```

The Doc ID is the part between `/d/` and `/edit`:
```
1a2b3c4d5e6f7g8h9i0j
```

## ✅ Step 3: Import the Document

### Option A: Using the Admin UI Component (Easiest)

1. **Add the component to your dashboard** (optional):
   - Edit `src/components/BeforeDashboard/index.tsx`
   - Add at the top: `import GoogleDocsImporter from '@/components/GoogleDocsImporter'`
   - Add in the component: `<GoogleDocsImporter />`

2. **Or create a custom page**:
   - Create: `src/app/(payload)/admin/import-google-doc/page.tsx`
   - Add this content:
   ```tsx
   import GoogleDocsImporter from '@/components/GoogleDocsImporter'
   
   export default function ImportGoogleDocPage() {
     return (
       <div style={{ padding: '40px' }}>
         <h1>Import Google Doc</h1>
         <GoogleDocsImporter />
       </div>
     )
   }
   ```
   - Visit: `http://localhost:3000/admin/import-google-doc`

3. **Enter your Doc ID** and click "Import Document"

### Option B: Using API Endpoint Directly

#### Using cURL:
```bash
curl -X POST http://localhost:3000/api/import/google-doc \
  -H "Content-Type: application/json" \
  -H "Cookie: payload-token=YOUR_JWT_TOKEN" \
  -d '{"docId": "YOUR_GOOGLE_DOC_ID"}'
```

#### Using JavaScript/TypeScript:
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

#### Using Postman/Insomnia:
- **Method**: POST
- **URL**: `http://localhost:3000/api/import/google-doc`
- **Headers**: 
  - `Content-Type: application/json`
  - `Cookie: payload-token=YOUR_JWT_TOKEN` (get this from browser after logging into admin)
- **Body** (JSON):
  ```json
  {
    "docId": "YOUR_GOOGLE_DOC_ID"
  }
  ```

## ✅ Step 4: Check the Result

After importing, you should see:

```json
{
  "success": true,
  "post": {
    "id": 1,
    "title": "Your Document Title",
    "slug": "your-document-title"
  },
  "imagesProcessed": 2
}
```

The post will be created as a **draft** in your Payload CMS `posts` collection.

## 📝 Example Workflow

1. ✅ OAuth completed
2. ✅ Refresh token added to `.env`
3. ✅ Server restarted
4. ⏳ Get Google Doc ID from URL
5. ⏳ Import via API or Admin UI
6. ⏳ Check `/admin/collections/posts` to see your imported post!

## 🔍 Troubleshooting

### "No refresh token found"
- Make sure `GOOGLE_REFRESH_TOKEN` is set in `.env`
- Restart your dev server after adding the token

### "Document not found"
- Verify the Doc ID is correct
- Make sure the Google account has access to the document
- Check that the document is shared with the account used for OAuth

### "Unauthorized"
- Make sure you're logged into Payload admin
- Include the `payload-token` cookie in your request

### Import takes a long time
- Large documents with many images may take 1-2 minutes
- Check server logs for progress

## 🎉 Success!

Once imported, you can:
- Edit the post in Payload admin
- Publish it
- View it on your website
- The content will be in Lexical format with all formatting preserved!

