# Google Docs Management System

## ✅ What's Been Created

### 1. **GoogleDocImports Collection**
   - Stores all imported Google Docs in the database
   - Tracks: title, Doc ID, linked post, sync status, last synced time, images count
   - Accessible in Payload admin at: `/admin/collections/google-doc-imports`

### 2. **Management Page**
   - **URL**: `/admin/google-docs`
   - **Features**:
     - Table view of all imported Google Docs
     - Shows: Title, Doc ID, Linked Post, Status, Last Synced, Images Count
     - **Sync button** to re-import/update documents
     - Status indicators (Active, Error, Syncing)
     - Direct links to posts

### 3. **API Endpoints**
   - `GET /api/google-doc-imports` - List all imports
   - `PATCH /api/google-doc-imports/[id]` - Update import record
   - `POST /api/import/google-doc` - Import/update (now saves to DB)

### 4. **Auto-Save on Import**
   - When you import a Google Doc, it automatically:
     - Creates/updates the import record
     - Links it to the created post
     - Tracks sync status and timestamps
     - Counts images

## 🚀 How to Use

### Step 1: Restart Your Server

The new collection needs to be loaded:
```bash
# Stop your server (Ctrl+C)
npm run dev
```

### Step 2: Access the Management Page

Visit: **http://localhost:3000/admin/google-docs**

### Step 3: Import a Google Doc

1. Use Postman or the import API to import a document
2. The import will automatically be saved to the database
3. It will appear in the management table

### Step 4: Sync Documents

1. Go to `/admin/google-docs`
2. Find the document you want to sync
3. Click the **"Sync"** button
4. The document will be re-imported and updated

## 📋 Features

### Table View Shows:
- ✅ **Title** - Document title
- ✅ **Doc ID** - Google Doc ID (truncated)
- ✅ **Post** - Link to the created Payload post
- ✅ **Status** - Active, Error, or Syncing
- ✅ **Last Synced** - When it was last imported
- ✅ **Images** - Number of images imported
- ✅ **Actions** - Sync button

### Sync Functionality:
- ✅ Re-imports the document from Google Docs
- ✅ Updates the existing post (doesn't create duplicates)
- ✅ Updates sync timestamp
- ✅ Updates status (Active/Error)
- ✅ Shows loading state while syncing

### Smart Import:
- ✅ If Doc ID already exists → **Updates** the existing post
- ✅ If Doc ID is new → **Creates** a new post
- ✅ Automatically creates/updates import record

## 🔗 Navigation

### From Payload Admin:
1. Go to `/admin`
2. You'll see "Google Doc Imports" in the collections list
3. Or visit `/admin/google-docs` directly

### Quick Links:
- **Manage Imports**: `/admin/google-docs`
- **Import New Doc**: Use Postman or create import page
- **View Collection**: `/admin/collections/google-doc-imports`

## 📝 Example Workflow

1. **Import a Google Doc** via API:
   ```bash
   POST /api/import/google-doc
   { "docId": "YOUR_DOC_ID" }
   ```

2. **Check Management Page**:
   - Visit `/admin/google-docs`
   - See your imported document in the table

3. **Edit in Google Docs**:
   - Make changes to the original Google Doc

4. **Sync**:
   - Go to `/admin/google-docs`
   - Click "Sync" button
   - Document is updated automatically!

5. **View Updated Post**:
   - Click the post link in the table
   - See the updated content

## 🎨 Customization

### Add to Dashboard:
You can add a link to the management page in your dashboard component:

```tsx
// In src/components/BeforeDashboard/index.tsx
<a href="/admin/google-docs">Manage Google Docs</a>
```

### Custom Styling:
The management page uses inline styles. You can:
- Create a CSS file for better styling
- Use Tailwind classes if configured
- Customize the table layout

## 🐛 Troubleshooting

### "Collection not found"
- Make sure you restarted the server after adding the collection
- Check that `GoogleDocImports` is in `payload.config.ts`

### "Imports not showing"
- Check that imports were actually created (check `/admin/collections/google-doc-imports`)
- Verify the API endpoint is working

### "Sync not working"
- Check that OAuth is still valid
- Verify refresh token is set in `.env`
- Check server logs for errors

## 📊 Database Schema

The `google-doc-imports` collection stores:
- `title` - Document title
- `googleDocId` - Unique Doc ID (indexed)
- `googleDocUrl` - Full URL (optional)
- `post` - Relationship to posts collection
- `lastSyncedAt` - Timestamp
- `status` - active | error | syncing
- `errorMessage` - Error details (if any)
- `imagesCount` - Number of images

## 🎉 Success!

You now have a complete Google Docs management system:
- ✅ Import tracking
- ✅ Sync functionality
- ✅ Status monitoring
- ✅ Easy management interface

Happy importing! 🚀


