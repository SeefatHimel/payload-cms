# Fix: Database Transaction Error

## The Error

```
current transaction is aborted, commands ignored until end of transaction block
```

This happens when a PostgreSQL transaction fails and subsequent queries try to run in the aborted transaction.

## Quick Fix

### Option 1: Restart Your Server (Easiest)

1. **Stop your dev server** (Ctrl+C)
2. **Start it again**: `npm run dev`
3. This will clear any stuck transactions

### Option 2: Check Database Connection

The error might be due to:
- Database connection issues
- Stuck transactions from previous operations
- Foreign key constraint violations

## Why This Happens

1. A previous database operation failed
2. The transaction wasn't properly rolled back
3. Subsequent operations try to run in the aborted transaction
4. PostgreSQL blocks them until the transaction is cleared

## Prevention

The import route now has better error handling, but if you see this error:

1. **Check if the import actually succeeded**:
   - Go to `/admin/collections/posts`
   - See if your imported post is there

2. **If the post exists but you can't delete it**:
   - Restart the server
   - Try deleting again

3. **If imports are failing**:
   - Check server logs for the actual error
   - The transaction error is usually a symptom, not the cause

## Common Causes

1. **Foreign Key Constraints**: Trying to delete a post that's referenced elsewhere
2. **Invalid Data**: Data that violates database constraints
3. **Connection Issues**: Database connection dropped mid-transaction
4. **Concurrent Operations**: Multiple operations on the same record

## For the Import Specifically

If you're seeing this during import:
- The import might have partially succeeded
- Check `/admin/collections/posts` for the imported post
- Check `/admin/google-docs` for the import record
- Restart server and try syncing again

## Long-term Solution

If this keeps happening:
1. Check database connection pool settings
2. Review foreign key constraints
3. Ensure proper transaction handling in custom code
4. Consider adding retry logic for transient errors


