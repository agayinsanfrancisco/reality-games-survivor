# Troubleshooting Castaway Images Not Loading

## Quick Checklist

### 1. ✅ Verify Database Has Photo URLs

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
SELECT name, photo_url 
FROM castaways 
WHERE photo_url IS NOT NULL 
LIMIT 5;
```

**Expected:** Should show castaway names with URLs like:
```
https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/rob-mariano.jpg
```

**If empty:** Run the attach script again:
```bash
npx tsx server/scripts/attach-castaway-images.ts
```

---

### 2. ✅ Check Supabase Storage Bucket

1. Go to **Supabase Dashboard → Storage**
2. Open the **`castaways`** bucket
3. Verify:
   - ✅ Files are uploaded (should see `.jpg` files)
   - ✅ Files are in the **root** of the bucket (not in subfolders)
   - ✅ Filenames match exactly (e.g., `rob-mariano.jpg`)

**Common issues:**
- Files in subfolder → Move to root
- Wrong filenames → Rename to match database URLs
- No files → Upload images

---

### 3. ✅ Verify Bucket is Public

1. Go to **Storage → castaways → Settings**
2. Check **"Public bucket"** toggle
3. Must be **ON** (enabled)

**If private:** Images won't load via public URLs

---

### 4. ✅ Test Image URL Directly

Open one of these URLs in your browser:
```
https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/rob-mariano.jpg
https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/sandra-diaz-twine.jpg
```

**Expected:** Image displays
**If 404:** File not uploaded or wrong filename
**If Access Denied:** Bucket is not public

---

### 5. ✅ Check Browser Console

1. Open your app in browser
2. Open Developer Tools (F12)
3. Go to **Console** tab
4. Look for image loading errors:
   - `404 Not Found` → File missing
   - `CORS error` → Bucket permissions issue
   - `403 Forbidden` → Bucket not public

---

### 6. ✅ Verify Frontend Code

The frontend uses `getAvatarUrl()` which:
- Returns `photo_url` if it exists
- Falls back to DiceBear avatar if missing

Check if `photo_url` is being passed correctly:
```typescript
// In browser console, check a castaway object:
// Should have: photo_url: "https://..."
```

---

## Common Issues & Solutions

### Issue: Images show as broken/placeholder

**Causes:**
1. Files not uploaded to storage
2. Filenames don't match database URLs
3. Bucket is private

**Solution:**
1. Upload images to `castaways` bucket
2. Ensure filenames match exactly (case-sensitive)
3. Make bucket public

---

### Issue: Database has URLs but images don't load

**Causes:**
1. Files not in storage
2. Wrong bucket name
3. Files in subfolder

**Solution:**
1. Check Storage → `castaways` bucket
2. Verify files are in root (not subfolders)
3. Test URL directly in browser

---

### Issue: Some images load, others don't

**Causes:**
1. Filename mismatches
2. Some files not uploaded

**Solution:**
1. Compare database `photo_url` with actual filenames
2. Upload missing files
3. Update database URLs if needed

---

### Issue: CORS errors in console

**Causes:**
1. Bucket CORS not configured
2. Bucket is private

**Solution:**
1. Make bucket public
2. Configure CORS in Storage settings (if needed)

---

## Quick Fix Commands

### Re-run attach script:
```bash
npx tsx server/scripts/attach-castaway-images.ts
```

### Check database values:
```sql
SELECT name, photo_url FROM castaways WHERE photo_url IS NULL;
```

### Test a sample URL:
```bash
curl -I https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/rob-mariano.jpg
```

Should return `HTTP/2 200` if accessible.

---

## Still Not Working?

1. **Check Supabase Dashboard:**
   - Storage → `castaways` → Files tab
   - Verify files exist and are in root

2. **Check Database:**
   - Table Editor → `castaways` table
   - Verify `photo_url` column has values

3. **Check Browser:**
   - Network tab → Look for failed image requests
   - Check error messages

4. **Test URL directly:**
   - Copy a `photo_url` from database
   - Paste in browser address bar
   - Should display image
