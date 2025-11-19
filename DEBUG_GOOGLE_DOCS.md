# 🔍 Debug: Save Google Docs API Response

This feature allows you to save the raw Google Docs API response to files for inspection and debugging.

## How to Enable

Add this to your `.env` file:

```env
SAVE_GOOGLE_DOCS_RESPONSE=true
```

## What Gets Saved

When you import a Google Doc, the following files will be saved to the `debug/` folder:

1. **`*-raw-api-response.json`** - The complete raw API response from Google Docs API
2. **`*-document-data.json`** - Just the document data (cleaner version)
3. **`*-parsed-lexical.json`** - The parsed Lexical format (what gets stored in Payload)
4. **`*-extracted-text.txt`** - Plain text extracted from the document (easy to read)

## File Naming

Files are named with:
- Document title (sanitized)
- First 8 characters of Doc ID
- Timestamp

Example:
```
google-doc-my_document-abc12345-2025-01-15T10-30-45-123Z-raw-api-response.json
```

## Location

All files are saved to:
```
/debug/
```

This folder is automatically added to `.gitignore` so debug files won't be committed.

## Usage

1. **Enable the feature:**
   ```env
   SAVE_GOOGLE_DOCS_RESPONSE=true
   ```

2. **Restart your server:**
   ```bash
   pnpm dev
   ```

3. **Import a Google Doc** through the UI or API

4. **Check the `debug/` folder** - you'll see the saved files

5. **Inspect the files:**
   - Open `*-raw-api-response.json` to see the full API response
   - Open `*-extracted-text.txt` to see the plain text content
   - Open `*-parsed-lexical.json` to see how it's converted to Lexical format

## Disable

To disable, remove the environment variable or set it to `false`:

```env
SAVE_GOOGLE_DOCS_RESPONSE=false
```

Or simply remove the line from `.env`.

## Use Cases

- **Debugging AI issues** - See what content the AI is receiving
- **Understanding the API structure** - Learn how Google Docs API structures data
- **Testing parsing logic** - Verify how content is being parsed
- **Inspecting document structure** - See headings, lists, images, etc.

## Example

After importing a document, you might see:

```
debug/
  ├── google-doc-my_blog_post-abc12345-2025-01-15T10-30-45-123Z-raw-api-response.json
  ├── google-doc-my_blog_post-abc12345-2025-01-15T10-30-45-123Z-document-data.json
  ├── google-doc-my_blog_post-abc12345-2025-01-15T10-30-45-123Z-parsed-lexical.json
  └── google-doc-my_blog_post-abc12345-2025-01-15T10-30-45-123Z-extracted-text.txt
```

## Notes

- Files are saved **only when importing** - not when syncing
- Files accumulate over time - you may want to clean the `debug/` folder periodically
- Large documents may create large JSON files
- The feature is **disabled by default** to avoid cluttering your filesystem

