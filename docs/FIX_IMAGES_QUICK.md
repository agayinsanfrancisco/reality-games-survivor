# Quick Fix: Images Not Loading (404 Error)

The images are returning 404 because they're not accessible at the Supabase Storage URLs.

## Immediate Fix Steps

### 1. Check Supabase Storage

Go to: **Supabase Dashboard → Storage → castaways bucket**

**Check:**
- ✅ Are there 24 `.jpg` files?
- ✅ Are they in the **root** of the bucket (not in a subfolder)?
- ✅ Is "Public bucket" enabled? (Settings → Public bucket = ON)

### 2. Test a URL

Open this in your browser:
```
https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/rob-mariano.jpg
```

**If 404:** File doesn't exist or wrong path
**If Access Denied:** Bucket is not public

### 3. Common Issues

**Files in subfolder:**
- Move all files to root level of `castaways` bucket

**Bucket not public:**
- Storage → castaways → Settings → Toggle "Public bucket" ON

**Files not uploaded:**
- Upload all 24 images to the `castaways` bucket
- Filenames must match exactly: `rob-mariano.jpg` (lowercase, hyphens)

### 4. Verify After Fix

1. Test URL in browser (should show image)
2. Refresh your app
3. Check browser console for errors
4. Images should now load!

## Temporary Workaround

The app will show DiceBear placeholder avatars until images are uploaded. This is automatic via the `getAvatarUrl()` function.
