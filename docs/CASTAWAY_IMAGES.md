# Castaway Images Guide

This guide explains how to attach images to castaways in the database.

## Overview

Castaway images are stored in Supabase Storage and referenced via the `photo_url` field in the `castaways` table. The images are served from the public `castaways` storage bucket.

## Storage Setup

### 1. Create Storage Bucket (if not exists)

In Supabase Dashboard:
1. Go to **Storage**
2. Create a new bucket named `castaways`
3. Set it to **Public** (so images can be accessed via URL)
4. Configure CORS if needed

### 2. Upload Images

Upload castaway images to the `castaways` bucket. Images should be:
- **Format**: JPG/JPEG (recommended)
- **Naming**: Use lowercase with hyphens (e.g., `rob-mariano.jpg`)
- **Size**: Recommended 400x400px or larger, optimized for web

**Naming Convention:**
- Convert castaway name to lowercase
- Replace spaces with hyphens
- Remove special characters
- Add `.jpg` extension

Examples:
- `Rob Mariano` → `rob-mariano.jpg`
- `Sandra Diaz-Twine` → `sandra-diaz-twine.jpg`
- `Tony Vlachos` → `tony-vlachos.jpg`

## Attaching Images to Database

### Option 1: Automated Script (Recommended)

Use the TypeScript script to automatically match and update castaway images:

```bash
# From project root
npx tsx server/scripts/attach-castaway-images.ts
```

Or use the shell script wrapper:

```bash
./scripts/update-castaway-images.sh
```

**What it does:**
1. Fetches all castaways from the database
2. Generates expected image URLs based on castaway names
3. Updates the `photo_url` field for each castaway
4. Generates a SQL migration file as backup

**Prerequisites:**
- Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in your `.env` file
- Images must be uploaded to Supabase Storage bucket `castaways`

### Option 2: Manual SQL Migration

Create a migration file in `supabase/migrations/`:

```sql
-- Update castaway photo URLs
UPDATE castaways 
SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/rob-mariano.jpg' 
WHERE name = 'Rob Mariano';

-- Repeat for each castaway...
```

Then apply:

```bash
npx supabase db push
```

### Option 3: Admin UI

Use the Admin Castaways page in the web app:
1. Navigate to `/admin/castaways`
2. Click edit on a castaway
3. Enter the photo URL manually
4. Save

## Listing Castaways and Expected Images

To see which castaways need images and their expected filenames:

```bash
# Dynamic listing from database (recommended)
npx tsx server/scripts/list-castaway-images.ts

# Static reference for Season 50
node scripts/match-castaway-images.js
```

## Image URL Format

Images are accessed via Supabase Storage public URLs:

```
https://{project_ref}.supabase.co/storage/v1/object/public/{bucket}/{filename}
```

For this project:
```
https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/{filename}
```

## Frontend Usage

The frontend uses the `getAvatarUrl` helper function from `@/lib/avatar.ts`:

```typescript
import { getAvatarUrl } from '@/lib/avatar';

// In a component
<img 
  src={getAvatarUrl(castaway.name, castaway.photo_url)} 
  alt={castaway.name} 
/>
```

This function:
- Returns the `photo_url` if it exists
- Falls back to a DiceBear avatar if no photo is set

## Troubleshooting

### Images not showing

1. **Check bucket is public**: Storage → `castaways` → Settings → Public bucket
2. **Verify URL format**: Check the `photo_url` in database matches the storage URL
3. **Check filename**: Ensure filename matches the naming convention
4. **CORS issues**: Configure CORS in Supabase Storage settings if needed

### Script errors

1. **Missing environment variables**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is set
2. **Permission errors**: Service role key must have admin access
3. **Network errors**: Check Supabase URL is correct

### Database updates not working

1. **RLS policies**: Script uses service role key (bypasses RLS)
2. **Check logs**: Review script output for specific errors
3. **Verify data**: Query database to confirm updates

## Files

- `server/scripts/attach-castaway-images.ts` - Main script to attach images
- `server/scripts/list-castaway-images.ts` - List castaways and expected images
- `scripts/match-castaway-images.js` - Static reference for Season 50
- `scripts/update-castaway-images.sh` - Shell wrapper script
- `supabase/migrations/012_castaway_storage_photos.sql` - Example migration

## Example Workflow

1. **Upload images to Supabase Storage:**
   ```bash
   # Via Supabase Dashboard or CLI
   # Upload to bucket: castaways
   ```

2. **List expected filenames:**
   ```bash
   npx tsx server/scripts/list-castaway-images.ts
   ```

3. **Attach images to database:**
   ```bash
   npx tsx server/scripts/attach-castaway-images.ts
   ```

4. **Verify in database:**
   ```sql
   SELECT name, photo_url FROM castaways WHERE photo_url IS NOT NULL;
   ```

5. **Check in frontend:**
   - Navigate to `/castaways` page
   - Verify images display correctly

## Notes

- Images are stored in Supabase Storage, not in the database
- The `photo_url` field stores the full public URL
- Fallback to DiceBear avatars if no photo is set
- Script generates SQL migration as backup
- All updates are logged for verification
