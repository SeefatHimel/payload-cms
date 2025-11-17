# Required Environment Variables for Render

## Essential Variables

Add these to your Render Web Service environment variables:

### 1. Database
```
DATABASE_URI=postgresql://cmsdb_7bph_user:cOl5L1mt544RChxG25apDmytmGw6ZK9r@dpg-d4d97gi4d50c73dkbr9g-a.singapore-postgres.render.com/cmsdb_7bph
```

### 2. Payload Secret
```
PAYLOAD_SECRET=57OLdWmwiQsxRbureGbwPOw28nGjJIt6nqFm2F0EIFU=
```

### 3. Server URL
```
NEXT_PUBLIC_SERVER_URL=https://your-service-name.onrender.com
```
Replace `your-service-name` with your actual Render service name.

### 4. Preview Secret (NEW - Required for Preview Mode)
```
PREVIEW_SECRET=Z0EslbLV/+qslh1ofVkeB1eti4JaqOy/S7kV1n91OiA=
```
This is required for draft preview functionality in the admin panel.

### 5. Google OAuth (Optional - if using Google Docs import)
```
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URL=https://your-service-name.onrender.com/api/google-oauth/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

## How to Add in Render

1. Go to your Render Web Service dashboard
2. Click on **Environment** tab
3. Click **Add Environment Variable** for each variable above
4. Copy and paste the exact values
5. Click **Save Changes**
6. Render will automatically redeploy

## Important Notes

- **PREVIEW_SECRET**: This is a new requirement. Without it, preview mode won't work and you'll see "You are not allowed to preview this page" errors.
- **NEXT_PUBLIC_SERVER_URL**: Must match your actual Render service URL exactly
- All secrets should be kept secure and never committed to Git

## After Adding Variables

1. Wait for Render to redeploy (usually 1-2 minutes)
2. Test your application
3. Preview mode should now work in the admin panel
4. Published posts should be visible on the frontend

