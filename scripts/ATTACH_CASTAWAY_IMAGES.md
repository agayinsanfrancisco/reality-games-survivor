# Attach Castaway Images

This guide helps you attach castaway images that are already uploaded to Supabase Storage to their database records.

## Prerequisites

1. ✅ Images already uploaded to Supabase Storage bucket `castaways`
2. ✅ Environment variables set:
   - `SUPABASE_URL` (defaults to production URL)
   - `SUPABASE_SERVICE_ROLE_KEY` (required)

## Quick Start

### Option 1: Using the Shell Script (Recommended)

```bash
./scripts/update-castaway-images.sh
```

### Option 2: Using TypeScript Directly

```bash
cd server
npx tsx scripts/attach-castaway-images.ts
```

## What the Script Does

1. **Fetches castaways** from the database
2. **Lists files** from Supabase Storage bucket `castaways`
3. **Matches** storage files to castaway names (fuzzy matching)
4. **Updates** the `photo_url` field in the database
5. **Generates** a SQL migration file as backup

## Matching Logic

The script matches filenames to castaway names using:
- Exact match: `rob-mariano.jpg` → `Rob Mariano`
- Case-insensitive matching
- Handles different file extensions (jpg, jpeg, png, webp)

## Output

The script will show:
- ✅ Castaways with matched images
- 🔄 Castaways that will be updated
- ⚠️ Castaways missing images in storage
- 📁 Unmatched files in storage

## Generated Files

- SQL migration file: `supabase/migrations/013_attach_castaway_images_*.sql`

## Troubleshooting

### "Missing SUPABASE_SERVICE_ROLE_KEY"
Set the environment variable:
```bash
export SUPABASE_SERVICE_ROLE_KEY='your-key-here'
```

Or add it to your `.env` file in the project root.

### Images Not Matching
- Check that filenames follow the pattern: `firstname-lastname.jpg`
- Example: `rob-mariano.jpg` for `Rob Mariano`
- The script uses fuzzy matching, but exact matches work best

### Files Not Found in Storage
- Verify images are in the `castaways` bucket
- Check bucket permissions (should be public)
- Ensure files are in the root of the bucket (not in subfolders)

## Example Output

```
🖼️  Attaching Castaway Images

📦 Storage Bucket: castaways
🔗 Base URL: https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways

📋 Fetching castaways from database...
   Found 24 castaways

📦 Listing files from Supabase Storage...
   Found 24 files in storage

📸 Castaway Image Mapping:

🔄 Will update 24 castaways:
   Rob Mariano
      Current: (none)
      New:     https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/rob-mariano.jpg

...

✅ All castaway images attached successfully!
```
