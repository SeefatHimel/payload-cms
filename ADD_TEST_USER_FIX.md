# Fix: "Access blocked - app is currently being tested" Error

## The Problem

You're getting `Error 403: access_denied` because your Google account (`himel.apploye@gmail.com`) is not added as a test user in Google Cloud Console.

When an OAuth app is in "Testing" mode, only approved test users can access it.

## Quick Fix: Add Yourself as a Test User

### Step 1: Go to OAuth Consent Screen

1. **Visit**: https://console.cloud.google.com/
2. **Select your project** (the one with your OAuth credentials)
3. **Navigate to**: **APIs & Services** → **OAuth consent screen**

### Step 2: Add Test Users

1. **Scroll down** to the **"Test users"** section
2. **Click "ADD USERS"** button
3. **Enter your email**: `himel.apploye@gmail.com`
4. **Click "ADD"**
5. **Click "SAVE"** at the bottom of the page

### Step 3: Wait and Try Again

1. **Wait 1-2 minutes** for changes to take effect
2. **Revoke previous access** (if you tried before):
   - Go to: https://myaccount.google.com/permissions
   - Find "Google Docs Payload CMG Integration"
   - Click **"Remove access"**
3. **Try OAuth again**:
   - Visit: `http://localhost:3000/api/google-oauth/login`
   - You should now be able to sign in!

## Visual Guide

```
Google Cloud Console
└── APIs & Services
    └── OAuth consent screen
        └── Test users section
            └── [ADD USERS] button
                └── Enter: himel.apploye@gmail.com
                    └── [ADD] → [SAVE]
```

## Adding Multiple Test Users

If you need to add multiple test users (e.g., for your team):

1. In the **"Test users"** section
2. Click **"ADD USERS"**
3. Add emails one at a time, or separate with commas:
   ```
   user1@example.com, user2@example.com, user3@example.com
   ```
4. Click **"ADD"**
5. Click **"SAVE"**

## Important Notes

### Testing Mode Limitations

- ✅ **Works for development**: Testing mode is perfect for development
- ✅ **Up to 100 test users**: You can add up to 100 test users
- ⚠️ **Unverified app warning**: Users will see "unverified app" warning (click "Advanced" → "Go to [App Name] (unsafe)")
- ⚠️ **Not for production**: For production with >100 users, you need to publish the app

### Publishing for Production (Optional)

If you want to make it public (remove the "unverified" warning):

1. Complete all required fields in OAuth consent screen
2. Submit for verification (can take several days)
3. Or keep it in Testing mode for development (recommended)

## Verification Checklist

After adding test users:

- [ ] Test user email added: `himel.apploye@gmail.com`
- [ ] Changes saved in Google Cloud Console
- [ ] Waited 1-2 minutes for propagation
- [ ] Revoked previous access (if applicable)
- [ ] Tried OAuth flow again

## Still Not Working?

### Check These:

1. **Email matches exactly**: Make sure the email you added matches the one you're signing in with
2. **App is in Testing mode**: Verify in OAuth consent screen → Publishing status should be "Testing"
3. **Test users section**: Make sure your email appears in the list
4. **Clear browser cache**: Sometimes browsers cache OAuth errors
5. **Try incognito mode**: To rule out browser extensions

### Common Mistakes:

❌ **Wrong**: Adding email with typos  
✅ **Correct**: Exact email match: `himel.apploye@gmail.com`

❌ **Wrong**: Not saving changes  
✅ **Correct**: Click "SAVE" after adding users

❌ **Wrong**: Using different Google account  
✅ **Correct**: Use the exact email you added as test user

## Next Steps After Fixing

Once you can sign in:

1. ✅ Complete OAuth flow
2. ✅ Check terminal for refresh token
3. ✅ Add refresh token to `.env`:
   ```env
   GOOGLE_REFRESH_TOKEN=your_refresh_token_here
   ```
4. ✅ Restart dev server
5. ✅ Start importing Google Docs!

