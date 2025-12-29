# Castaways Page Fixes

## Issues Fixed

### 1. ✅ Tribe Separation
- Castaways are now grouped by tribe (Vatu, Kalo, Cila)
- Each tribe has a colored header with tribe name
- Tribe badges appear on each castaway card

### 2. ✅ Expanded View
- Fixed expanded view to always show content when clicked
- Shows previous seasons and trivia when available
- Shows "No additional information" if no trivia data
- Weekly performance always visible in expanded view

### 3. ⚠️ Image Loading
- Added error handling to fallback to DiceBear avatars if images fail
- Images will show placeholder until uploaded to Supabase Storage

## Required Steps

### Step 1: Apply Tribe Migration

Run the migration to set tribe data:

```bash
npx supabase db push
```

This will assign all 24 castaways to their tribes:
- **Vatu Tribe (Purple)**: 8 castaways
- **Kalo Tribe (Teal)**: 8 castaways  
- **Cila Tribe (Orange)**: 8 castaways

### Step 2: Fix Images

The images are returning 404 errors. To fix:

1. **Go to Supabase Dashboard → Storage → `castaways` bucket**

2. **Check:**
   - ✅ Are 24 `.jpg` files uploaded?
   - ✅ Are files in the **root** of the bucket (not in subfolders)?
   - ✅ Is "Public bucket" enabled? (Settings → Public bucket = ON)

3. **Verify filenames match exactly:**
   - `rob-mariano.jpg` (not `Rob-Mariano.jpg`)
   - `sandra-diaz-twine.jpg`
   - etc.

4. **Test a URL directly:**
   ```
   https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/rob-mariano.jpg
   ```

### Step 3: Verify Data

Check that castaways have:
- `tribe_original` set (after migration)
- `previous_seasons` array populated
- `fun_fact` text populated

Run in Supabase SQL Editor:
```sql
SELECT 
  name,
  tribe_original,
  previous_seasons,
  fun_fact
FROM castaways 
WHERE season_id = (SELECT id FROM seasons WHERE number = 50)
LIMIT 5;
```

## What's Working Now

✅ **Tribe Grouping**: Castaways separated by tribe with colored headers
✅ **Tribe Badges**: Each card shows tribe badge
✅ **Expanded View**: Always shows when clicked, displays:
   - Previous seasons (if available)
   - Fun facts/trivia (if available)
   - Weekly performance stats
✅ **Image Fallback**: Shows DiceBear avatars if images fail to load

## What Needs Action

⚠️ **Images**: Upload images to Supabase Storage or they'll show placeholders
⚠️ **Migration**: Run `npx supabase db push` to set tribes
⚠️ **Data**: Verify `previous_seasons` and `fun_fact` are populated in database
