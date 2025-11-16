# Google Docs → Payload CMS Importer

This guide explains how to use the Google Docs importer to import blog posts from Google Docs into Payload CMS.

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Google OAuth Credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here

# OAuth Redirect URL (must match Google Cloud Console settings)
GOOGLE_REDIRECT_URL=http://localhost:3000/api/google-oauth/callback
# For production: https://yourdomain.com/api/google-oauth/callback

# Refresh Token (will be set automatically after OAuth flow)
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

### 2. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Docs API
   - Google Drive API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen:
   - User Type: Internal or External (depending on your needs)
   - Scopes: Add `https://www.googleapis.com/auth/documents.readonly` and `https://www.googleapis.com/auth/drive.readonly`
6. Set authorized redirect URIs:
   - `http://localhost:3000/api/google-oauth/callback` (for development)
   - `https://yourdomain.com/api/google-oauth/callback` (for production)

## Usage

### Step 1: Authenticate with Google

1. Visit: `http://localhost:3000/api/google-oauth/login`
2. You'll be redirected to Google's login page
3. Sign in and grant permissions
4. You'll be redirected back to your admin panel
5. **Important**: Check your console/terminal for the refresh token output
6. Copy the refresh token and add it to your `.env` file as `GOOGLE_REFRESH_TOKEN`

### Step 2: Import a Google Doc

#### Option A: Using API Endpoint

Make a POST request to `/api/import/google-doc`:

```bash
curl -X POST http://localhost:3000/api/import/google-doc \
  -H "Content-Type: application/json" \
  -H "Cookie: payload-token=YOUR_JWT_TOKEN" \
  -d '{"docId": "YOUR_GOOGLE_DOC_ID"}'
```

#### Option B: Using JavaScript/TypeScript

```typescript
const response = await fetch('/api/import/google-doc', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Include authentication cookie
  },
  body: JSON.stringify({
    docId: 'YOUR_GOOGLE_DOC_ID'
  })
})

const result = await response.json()
console.log(result)
```

### Getting the Google Doc ID

The Google Doc ID is found in the document URL:
```
https://docs.google.com/document/d/DOC_ID_HERE/edit
```

Extract the `DOC_ID_HERE` part.

## Features

### Supported Content Types

✅ **Paragraphs** - Converted to Lexical paragraph nodes  
✅ **Headings** - H1, H2, H3, H4 converted to Lexical heading nodes  
✅ **Lists** - Ordered and unordered lists with nesting support  
✅ **Inline Formatting** - Bold, italic, underline  
✅ **Tables** - Table content extracted as text (simplified format)  
✅ **Images** - Inline images downloaded and uploaded to Payload media collection  

### Limitations

- **Tables**: Currently converted to simplified text format (cells separated by ` | `)
- **Complex Formatting**: Some advanced formatting may not be preserved
- **Images**: Images are added as MediaBlock nodes at the end of the document (not inline)
- **Links**: Links in Google Docs are not currently converted

## API Routes

### `GET /api/google-oauth/login`

Initiates the OAuth flow. Redirects user to Google login page.

### `GET /api/google-oauth/callback`

OAuth callback endpoint. Receives authorization code and exchanges it for tokens.

**Query Parameters:**
- `code` - Authorization code from Google
- `error` - Error message if authorization failed

### `POST /api/import/google-doc`

Imports a Google Doc into Payload CMS.

**Request Body:**
```json
{
  "docId": "string" // Required: Google Doc ID
}
```

**Response:**
```json
{
  "success": true,
  "post": {
    "id": 1,
    "title": "Document Title",
    "slug": "document-title"
  },
  "imagesProcessed": 2
}
```

**Error Responses:**
- `400` - Invalid request (missing docId)
- `401` - Authentication failed (need to re-authenticate)
- `403` - Unauthorized (not logged in)
- `404` - Document not found
- `500` - Server error

## Troubleshooting

### "No refresh token received"

- Make sure `prompt=consent` is set in the OAuth flow (it is by default)
- Revoke access to your app in [Google Account Settings](https://myaccount.google.com/permissions)
- Try the OAuth flow again

### "Document not found"

- Verify the document ID is correct
- Ensure the Google account has access to the document
- Check that the OAuth scopes include `drive.readonly`

### "Failed to refresh access token"

- Verify `GOOGLE_REFRESH_TOKEN` is set in your `.env` file
- The refresh token may have been revoked - complete OAuth flow again

### Images not importing

- Images are extracted from the exported HTML version of the document
- Some image formats or embedded images may not be accessible
- Check console logs for specific image errors

## Security Notes

- **Never commit** your `.env` file with tokens to version control
- Refresh tokens should be stored securely (database recommended for production)
- Consider implementing token rotation for production use
- The current implementation stores tokens in environment variables - for production, use a database

## Production Considerations

1. **Token Storage**: Use a database to store refresh tokens instead of environment variables
2. **Error Handling**: Add more robust error handling and logging
3. **Rate Limiting**: Implement rate limiting on the import endpoint
4. **Image Processing**: Improve image placement to match original document layout
5. **Link Conversion**: Add support for converting links from Google Docs
6. **Table Formatting**: Improve table conversion to preserve structure

## Optional: Admin UI Component

A React component is available at `src/components/GoogleDocsImporter/index.tsx` that provides a user-friendly interface for importing Google Docs.

### Adding to Dashboard

You can add the importer to your dashboard by updating `src/components/BeforeDashboard/index.tsx`:

```tsx
import GoogleDocsImporter from '@/components/GoogleDocsImporter'

// Add inside your BeforeDashboard component:
<GoogleDocsImporter />
```

### Adding as a Custom Page

Create a new page at `src/app/(payload)/admin/import-google-doc/page.tsx`:

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

Then access it at `/admin/import-google-doc`.

## Files Structure

```
src/
├── app/(payload)/api/
│   ├── google-oauth/
│   │   ├── login/route.ts          # OAuth initiation
│   │   └── callback/route.ts       # OAuth callback
│   └── import/
│       └── google-doc/route.ts     # Main import endpoint
├── components/
│   └── GoogleDocsImporter/
│       └── index.tsx               # Admin UI component (optional)
└── utilities/
    ├── googleOAuth.ts              # OAuth token management
    ├── googleDocsParser.ts         # Google Docs → Lexical converter
    └── googleDocsImageHandler.ts   # Image download/upload
```

## Support

For issues or questions, check:
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Google Docs API Documentation](https://developers.google.com/docs/api)
- [Google Drive API Documentation](https://developers.google.com/drive/api)

