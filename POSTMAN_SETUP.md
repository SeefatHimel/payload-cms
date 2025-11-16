# Using Postman to Import Google Docs

## What You Need

1. **Google Doc ID** (extracted from the URL)
2. **JWT Token** (from Payload admin - we'll get this)
3. **Postman** (or any API client)

## Step 1: Get Your Google Doc ID or URL

You can use **either**:

**Option A: Full URL** (easiest - just paste it!)
```
https://docs.google.com/document/d/1a2b3c4d5e6f7g8h9i0j/edit
```

**Option B: Just the Doc ID**
```
1a2b3c4d5e6f7g8h9i0j
```

The system will automatically extract the ID from the URL if you paste the full URL!

**Just paste your full Google Doc URL here and I'll extract the ID for you!**

## Step 2: Get Your JWT Token (Payload Auth Cookie)

### Method 1: From Browser (Easiest)

1. **Open your browser** and go to: `http://localhost:3000/admin`
2. **Log in** to Payload admin
3. **Open Developer Tools** (F12 or Right-click → Inspect)
4. **Go to Application/Storage tab** → **Cookies** → `http://localhost:3000`
5. **Find the cookie named**: `payload-token`
6. **Copy the Value** (it's a long JWT token)

### Method 2: From Network Tab

1. **Open Developer Tools** (F12)
2. **Go to Network tab**
3. **Refresh the admin page**
4. **Click on any request** (like `/api/users/me`)
5. **Look at Request Headers** → find `Cookie: payload-token=...`
6. **Copy the token value**

## Step 3: Postman Configuration

### Request Setup:

**Method**: `POST`

**URL**: 
```
http://localhost:3000/api/import/google-doc
```

### Headers:

Add these headers:

| Key | Value |
|-----|-------|
| `Content-Type` | `application/json` |
| `Cook ie` | `payload-token=YOUR_JWT_TOKEN_HERE` |

*(Replace `YOUR_JWT_TOKEN_HERE` with the token you copied)*

### Body:

1. **Select**: `raw` and `JSON` (from dropdown)
2. **Paste this** (replace `YOUR_DOC_ID` with your actual Doc ID):

```json
{
  "docId": "YOUR_DOC_ID_OR_URL"
}
```

### Examples:

**Using full URL:**
```json
{
  "docId": "https://docs.google.com/document/d/1a2b3c4d5e6f7g8h9i0j/edit"
}
```

**Using just the ID:**
```json
{
  "docId": "1a2b3c4d5e6f7g8h9i0j"
}
```

Both formats work! The system automatically extracts the ID from URLs.

## Step 4: Send the Request

Click **Send** in Postman.

## Expected Response

### Success (200 OK):
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

### Error Examples:

**401 Unauthorized:**
```json
{
  "error": "Unauthorized. Please log in to import documents."
}
```
→ Make sure you're logged into Payload admin and have the correct token

**404 Not Found:**
```json
{
  "error": "Document not found or inaccessible"
}
```
→ Check that the Doc ID is correct and the document is accessible

**400 Bad Request:**
```json
{
  "error": "Invalid request. docId is required."
}
```
→ Make sure the JSON body is correct

## Quick Checklist

- [ ] Google Doc ID extracted from URL
- [ ] JWT token copied from browser cookies
- [ ] Postman request configured:
  - [ ] Method: POST
  - [ ] URL: `http://localhost:3000/api/import/google-doc`
  - [ ] Header: `Content-Type: application/json`
  - [ ] Header: `Cookie: payload-token=YOUR_TOKEN`
  - [ ] Body: JSON with `{"docId": "..."}`
- [ ] Dev server is running
- [ ] Refresh token is set in `.env`

## Troubleshooting

### "Unauthorized" Error
- Make sure you're logged into Payload admin
- Check that the JWT token is correct
- Token might have expired - log out and log back in to get a new token

### "Document not found"
- Verify the Doc ID is correct
- Make sure the Google account (used for OAuth) has access to the document
- Try opening the document in your browser to confirm it's accessible

### "No refresh token found"
- Make sure `GOOGLE_REFRESH_TOKEN` is set in `.env`
- Restart your dev server after adding the token

## Alternative: Using Postman Environment Variables

You can set up Postman environment variables:

1. **Create Environment** in Postman
2. **Add variables**:
   - `base_url`: `http://localhost:3000`
   - `jwt_token`: `YOUR_JWT_TOKEN`
   - `doc_id`: `YOUR_DOC_ID`
3. **Use in request**:
   - URL: `{{base_url}}/api/import/google-doc`
   - Cookie header: `payload-token={{jwt_token}}`
   - Body: `{"docId": "{{doc_id}}"}`

