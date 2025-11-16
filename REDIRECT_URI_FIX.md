# Fix: redirect_uri_mismatch Error

## The Problem

You're getting `Error 400: redirect_uri_mismatch` because the redirect URI in your code doesn't match what's configured in Google Cloud Console.

## What Redirect URI Are We Using?

Based on your `.env` file, we're using:
```
http://localhost:3000/api/google-oauth/callback
```

## Quick Fix Steps

### Step 1: Check What Redirect URI We're Actually Using

Visit this debug endpoint to see the exact redirect URI:
```
http://localhost:3000/api/google-oauth/debug
```

This will show you the exact redirect URI that needs to be added to Google Cloud Console.

### Step 2: Add Redirect URI to Google Cloud Console

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Navigate to**: APIs & Services → Credentials
3. **Click on your OAuth 2.0 Client ID** (find it in your Google Cloud Console)
4. **Scroll to "Authorized redirect URIs"**
5. **Click "ADD URI"**
6. **Add this EXACT URI** (no trailing slash, exact match):
   ```
   http://localhost:3000/api/google-oauth/callback
   ```
7. **Click "SAVE"**

### Step 3: Important Notes

- ✅ **Exact match required**: The URI must match EXACTLY (including http vs https, port numbers, path)
- ✅ **No trailing slash**: `http://localhost:3000/api/google-oauth/callback` ✅ (correct)
- ❌ **No trailing slash**: `http://localhost:3000/api/google-oauth/callback/` ❌ (wrong)
- ✅ **Case sensitive**: Paths are case-sensitive
- ✅ **Wait a few minutes**: Changes may take 1-2 minutes to propagate

### Step 4: If Using a Different Port or Domain

If you're running on a different port (e.g., `http://localhost:3001`), update:

1. **In `.env` file**:
   ```env
   GOOGLE_REDIRECT_URL=http://localhost:3001/api/google-oauth/callback
   NEXT_PUBLIC_SERVER_URL=http://localhost:3001
   ```

2. **In Google Cloud Console**: Add the matching URI

### Step 5: If Using a Tunnel (like ngrok or devtunnels)

I see you have a commented line in `.env`:
```
# GOOGLE_REDIRECT_URL=https://8mvczjvx-3000.asse.devtunnels.ms/api/google-oauth/callback
```

If you're using a tunnel:

1. **Uncomment and update** the tunnel URL in `.env`:
   ```env
   GOOGLE_REDIRECT_URL=https://YOUR_TUNNEL_URL/api/google-oauth/callback
   ```

2. **Add the tunnel URL** to Google Cloud Console:
   ```
   https://YOUR_TUNNEL_URL/api/google-oauth/callback
   ```

3. **Restart your dev server**

## Verification

After adding the redirect URI:

1. **Wait 1-2 minutes** for changes to propagate
2. **Visit**: `http://localhost:3000/api/google-oauth/debug` to verify the redirect URI
3. **Try OAuth again**: `http://localhost:3000/api/google-oauth/login`

## Common Mistakes

### ❌ Wrong: Adding just the domain
```
http://localhost:3000
```

### ✅ Correct: Full path including /api/google-oauth/callback
```
http://localhost:3000/api/google-oauth/callback
```

### ❌ Wrong: Trailing slash
```
http://localhost:3000/api/google-oauth/callback/
```

### ✅ Correct: No trailing slash
```
http://localhost:3000/api/google-oauth/callback
```

### ❌ Wrong: Using https for localhost
```
https://localhost:3000/api/google-oauth/callback
```

### ✅ Correct: Using http for localhost
```
http://localhost:3000/api/google-oauth/callback
```

## Still Not Working?

1. **Check the debug endpoint**: `/api/google-oauth/debug` shows the exact URI
2. **Verify in Google Cloud Console**: Make sure the URI is listed exactly as shown
3. **Clear browser cache**: Sometimes browsers cache OAuth errors
4. **Try incognito mode**: To rule out browser extensions
5. **Check server logs**: Look for the `[OAuth Debug] Redirect URI being used:` message

## For Production

When deploying to production, you'll need to:

1. Add your production redirect URI:
   ```
   https://yourdomain.com/api/google-oauth/callback
   ```

2. Update `.env`:
   ```env
   GOOGLE_REDIRECT_URL=https://yourdomain.com/api/google-oauth/callback
   ```

3. Add it to Google Cloud Console

