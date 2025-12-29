# Fix: Images Not Loading (404 Error)

The error `{"message":"Route GET:/object not found","error":"Not Found","statusCode":404}` means the images aren't accessible at the Supabase Storage URLs.

## Quick Fix Steps

### 1. Check if Images are Uploaded

Go to **Supabase Dashboard → Storage → castaways bucket**

- ✅ **If you see files:** They're uploaded, but might be in wrong location
- ❌ **If empty:** You need to upload the images

### 2. Verify File Location

Images must be in the **root** of the `castaways` bucket, not in subfolders.

**Correct:**
```
castaways/
  ├── rob-mariano.jpg
  ├── sandra-diaz-twine.jpg
  └── ...
```

**Wrong:**
```
castaways/
  └── images/
      ├── rob-mariano.jpg
      └── ...
```

### 3. Check Bucket is Public

1. Go to **Storage → castaways → Settings**
2. Find **"Public bucket"** toggle
3. **Must be ON** (enabled)

If it's off, images won't be accessible via public URLs.

### 4. Verify Filenames Match

The database expects exact filenames. Check a few:

```sql
SELECT name, photo_url FROM castaways LIMIT 5;
```

Then verify those exact filenames exist in Storage:
- `rob-mariano.jpg` (not `Rob-Mariano.jpg` or `rob_mariano.jpg`)
- `sandra-diaz-twine.jpg`
- etc.

### 5. Test a URL Directly

Copy a `photo_url` from the database and paste it in your browser:
```
https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/rob-mariano.jpg
```

**Expected:** Image displays
**If 404:** File doesn't exist or wrong path
**If Access Denied:** Bucket is not public

## Common Issues

### Issue: Files in Subfolder

**Solution:** Move files to root of bucket
1. Storage → castaways → Open subfolder
2. Select all files
3. Move to root level

### Issue: Wrong Filenames

**Solution:** Rename files to match database exactly
- Database has: `rob-mariano.jpg`
- Storage must have: `rob-mariano.jpg` (case-sensitive)

### Issue: Bucket Not Public

**Solution:** Enable public access
1. Storage → castaways → Settings
2. Toggle **"Public bucket"** to ON
3. Save

### Issue: Files Not Uploaded

**Solution:** Upload images
1. Storage → castaways → Upload
2. Upload all 24 `.jpg` files
3. Ensure they're in root (not subfolder)

## Verify Fix

After fixing, test again:
1. Refresh your app
2. Check browser console for errors
3. Test a direct URL in browser
4. Images should now load!

## Alternative: Use Placeholder Images

If you can't upload images right now, the app will fall back to DiceBear avatars automatically. The `getAvatarUrl()` function handles this.
