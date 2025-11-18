# Enable Google Drive API

## The Issue

The import is failing because **Google Drive API is not enabled** in your Google Cloud Console project.

## Quick Fix

### Step 1: Enable Google Drive API

1. **Visit this link** (or go to Google Cloud Console):
   ```
   https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=157994625614
   ```

2. **Click "ENABLE"** button

3. **Wait 1-2 minutes** for the API to be activated

### Step 2: Verify APIs are Enabled

Make sure both APIs are enabled:

1. **Google Docs API**:
   - https://console.developers.google.com/apis/api/docs.googleapis.com/overview?project=157994625614

2. **Google Drive API**:
   - https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=157994625614

### Step 3: Try Import Again

After enabling the API, wait a minute and try importing again.

## Alternative: Import Without Images

The import will now **continue even if images fail**. The document text will be imported, but images will be skipped if the Drive API is not enabled.

## Why Drive API is Needed

The Drive API is used to:
- Export the document as HTML to extract image URLs
- Download images from Google Drive

Without it, images cannot be extracted, but the text content can still be imported.

## Verification

After enabling, you should see in your server logs:
```
[Import] Found X images
```

Instead of:
```
Error extracting images from exported doc
```

## Still Having Issues?

1. **Check API status** in Google Cloud Console
2. **Wait a few minutes** after enabling (propagation delay)
3. **Verify OAuth scopes** include `drive.readonly`
4. **Check project billing** (some APIs require billing to be enabled)

