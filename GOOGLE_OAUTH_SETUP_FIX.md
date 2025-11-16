# Fix: "Access blocked: Google verification process" Error

This error occurs because your Google OAuth app needs to be configured for testing. Here's how to fix it:

## Solution: Configure OAuth Consent Screen

### Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Select your project (or create one if needed)
3. Navigate to: **APIs & Services** → **OAuth consent screen**

### Step 2: Configure OAuth Consent Screen

#### Option A: For Personal/Development Use (Recommended for Testing)

1. **User Type**: Select **"External"** (unless you have Google Workspace)
2. **App Information**:
   - App name: `Payload CMS Google Docs Importer` (or any name)
   - User support email: Your email
   - App logo: (optional)
   - App domain: (leave blank for development)
   - Developer contact: Your email

3. **Scopes**:
   - Click **"Add or Remove Scopes"**
   - Add these scopes:
     - `https://www.googleapis.com/auth/documents.readonly`
     - `https://www.googleapis.com/auth/drive.readonly`
   - Click **"Update"**

4. **Test Users** (IMPORTANT):
   - Scroll down to **"Test users"** section
   - Click **"ADD USERS"**
   - Add your Google account email (the one you'll use to sign in)
   - Click **"ADD"**

5. **Publishing Status**:
   - Keep it as **"Testing"** (you'll see a warning - that's OK for development)
   - Click **"SAVE AND CONTINUE"** through all steps
   - Click **"BACK TO DASHBOARD"**

#### Option B: For Google Workspace Users

1. **User Type**: Select **"Internal"**
2. This allows all users in your organization automatically
3. Follow the same steps for App Information and Scopes

### Step 3: Verify Credentials

1. Go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID
3. Click to edit it
4. Under **"Authorized redirect URIs"**, make sure you have:
   ```
   http://localhost:3000/api/google-oauth/callback
   ```
5. Click **"SAVE"**

### Step 4: Enable Required APIs

Make sure these APIs are enabled:

1. Go to **APIs & Services** → **Library**
2. Search and enable:
   - **Google Docs API**
   - **Google Drive API**

### Step 5: Try Again

1. **Revoke previous access** (if needed):
   - Go to: https://myaccount.google.com/permissions
   - Find "Payload CMS Google Docs Importer" (or your app name)
   - Click **"Remove access"**

2. **Try the OAuth flow again**:
   - Visit: `http://localhost:3000/api/google-oauth/login`
   - You should now see a warning about "unverified app" - click **"Advanced"** → **"Go to [Your App Name] (unsafe)"**
   - Sign in and grant permissions

## Important Notes

### For Development/Testing:
- ✅ You can use "Testing" mode with test users
- ✅ No verification needed for testing
- ✅ Limited to test users you add

### For Production:
- ⚠️ You'll need to submit for verification if:
  - You want to make it public
  - You want to remove the "unverified app" warning
  - You need more than 100 users

### Quick Checklist:

- [ ] OAuth consent screen configured
- [ ] Test users added (your email)
- [ ] Scopes added (docs.readonly, drive.readonly)
- [ ] Redirect URI configured
- [ ] Google Docs API enabled
- [ ] Google Drive API enabled
- [ ] Previous access revoked (if needed)

## Still Having Issues?

### Error: "Access blocked: This app's request is invalid"

**Solution**: Check that:
- Redirect URI matches exactly: `http://localhost:3000/api/google-oauth/callback`
- Client ID and Secret are correct in `.env`
- APIs are enabled

### Error: "redirect_uri_mismatch"

**Solution**: 
- Go to Credentials → Edit OAuth Client
- Add exact redirect URI: `http://localhost:3000/api/google-oauth/callback`
- No trailing slash!

### Error: "invalid_client"

**Solution**:
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Make sure there are no extra spaces or quotes
- Restart your dev server after changing `.env`

## Alternative: Use Service Account (Advanced)

If OAuth continues to be problematic, you can use a Service Account instead:

1. Create a Service Account in Google Cloud Console
2. Download the JSON key
3. Share your Google Docs with the service account email
4. Use service account credentials instead of OAuth

However, OAuth is recommended for this use case as it's simpler for end users.

