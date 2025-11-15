# Project Setup Report - Payload CMS with Supabase PostgreSQL

## Issue Summary

When attempting to run the Payload CMS project with Supabase PostgreSQL database, we encountered a database connection error. The main issues were:

1. **Missing Package Manager**: `pnpm` was not installed on the system
2. **Incorrect Database Connection String**: The initial connection string had placeholder values
3. **IPv4 Compatibility Issue**: The direct PostgreSQL connection from Supabase is IPv6-only and not compatible with IPv4 networks
4. **Special Character Encoding**: The database password contained special characters (`?`) that needed URL encoding
5. **Environment Variable Caching**: Next.js was caching old environment variables

## Root Cause Analysis

### Primary Issue: IPv4 Incompatibility
The Supabase direct connection (`db.pkspoykxkylbzblflrdg.supabase.co:5432`) only supports IPv6 connections. Most Windows networks and development environments use IPv4, causing DNS resolution failures (`ENOTFOUND` error).

**Error Message:**
```
Error: getaddrinfo ENOTFOUND db.pkspoykxkylbzblflrdg.supabase.co
```

### Secondary Issues
- Password special characters (`?`) in connection strings require URL encoding
- Next.js caches environment variables, requiring cache clearing for changes to take effect

## Solution

### Step 1: Install Required Dependencies
```bash
npm install -g pnpm
```

### Step 2: Use Session Pooler Connection
Instead of the direct connection, use Supabase's Session Pooler which supports IPv4:

**Direct Connection (IPv6 only - doesn't work on IPv4):**
```
postgresql://postgres:[PASSWORD]@db.pkspoykxkylbzblflrdg.supabase.co:5432/postgres
```

**Session Pooler Connection (IPv4 compatible - use this):**
```
postgresql://postgres.pkspoykxkylbzblflrdg:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

### Step 3: URL Encode Special Characters
Passwords with special characters must be URL-encoded:
- `?` becomes `%3F`
- Other special characters should also be encoded

### Step 4: Update .env File
Update the `DATABASE_URI` in your `.env` file with the Session Pooler connection string and URL-encoded password.

### Step 5: Clear Next.js Cache
```bash
# Remove .next directory to clear cached environment variables
rm -rf .next
# or on Windows PowerShell:
Remove-Item -Path .next -Recurse -Force
```

## Complete Setup Guide: Running the Project After Creation

### Prerequisites
1. **Node.js** (v18.20.2 or >=20.9.0)
2. **pnpm** package manager (v9 or v10)
3. **Supabase Account** with an active project

### Step-by-Step Setup Instructions

#### 1. Install pnpm (if not already installed)
```bash
npm install -g pnpm
```

#### 2. Install Project Dependencies
```bash
pnpm install
```

#### 3. Set Up Supabase Database

**a. Create a Supabase Project**
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Wait for the database to be provisioned

**b. Get Your Connection String**
- In Supabase dashboard, go to **Project Settings** → **Database**
- Click **"Connect to your project"** or **"Connection string"**
- **Important**: Change the **Method** dropdown from "Direct connection" to **"Session pooler"** (or "Transaction pooler")
- Copy the connection string (it should look like):
  ```
  postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-[NUMBER]-[REGION].pooler.supabase.com:5432/postgres
  ```

**c. Verify Project Status**
- Ensure your Supabase project is **active** (not paused)
- Paused projects cannot accept connections

#### 4. Configure Environment Variables

**a. Locate or Create .env File**
- The project should have a `.env` file in the root directory
- If it doesn't exist, create one

**b. Update DATABASE_URI**
- Open the `.env` file
- Find or add the `DATABASE_URI` variable
- Replace `[YOUR-PASSWORD]` with your actual Supabase database password
- **Important**: If your password contains special characters, URL-encode them:
  - Use PowerShell: `[System.Uri]::EscapeDataString("your-password")`
  - Or use an online URL encoder
  - Common encodings:
    - `?` → `%3F`
    - `@` → `%40`
    - `#` → `%23`
    - `&` → `%26`
    - `%` → `%25`

**Example .env file:**
```env
DATABASE_URI=postgresql://postgres.pkspoykxkylbzblflrdg:Pp89Cm3EL_x%3F-JK@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
PAYLOAD_SECRET=your-secret-key-here
```

#### 5. Clear Next.js Cache (if updating .env)
```bash
# Windows PowerShell
Remove-Item -Path .next -Recurse -Force

# Linux/Mac
rm -rf .next
```

#### 6. Start the Development Server
```bash
pnpm dev
```

#### 7. Verify Connection
- The server should start without database connection errors
- Open `http://localhost:3000` in your browser
- Access admin panel at `http://localhost:3000/admin`
- If you see connection errors, check:
  - Supabase project is active (not paused)
  - Connection string uses Session Pooler (not direct connection)
  - Password is correctly URL-encoded
  - No typos in the connection string

## Common Issues and Solutions

### Issue: "password authentication failed"
**Solution**: Verify your password is correct and properly URL-encoded in the connection string.

### Issue: "getaddrinfo ENOTFOUND"
**Solution**: 
- Use Session Pooler instead of direct connection
- Ensure Supabase project is active (not paused)
- Check your internet connection

### Issue: "Cannot read properties of undefined (reading 'searchParams')"
**Solution**: URL-encode special characters in your password.

### Issue: Server still using old connection string
**Solution**: 
- Stop the server completely
- Clear `.next` cache directory
- Restart the server

### Issue: "Project is paused"
**Solution**: Go to Supabase dashboard and resume your project.

## Key Takeaways

1. **Always use Session Pooler** for Supabase connections on IPv4 networks (most development environments)
2. **URL-encode special characters** in passwords when using connection strings
3. **Clear Next.js cache** when updating environment variables
4. **Verify Supabase project status** - ensure it's active, not paused
5. **Test the connection string** format before starting the server

## Connection String Format Reference

### Session Pooler (Recommended for Development)
```
postgresql://postgres.[PROJECT_REF]:[URL_ENCODED_PASSWORD]@aws-[NUMBER]-[REGION].pooler.supabase.com:5432/postgres
```

### Direct Connection (IPv6 only - not recommended for most setups)
```
postgresql://postgres:[URL_ENCODED_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

## Additional Resources

- [Supabase Connection Pooling Documentation](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

**Report Generated**: After successful project setup and troubleshooting
**Project**: Payload CMS Website Template with Supabase PostgreSQL
**Status**: ✅ Successfully Resolved

