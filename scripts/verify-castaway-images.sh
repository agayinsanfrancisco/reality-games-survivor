#!/bin/bash

# Quick verification script to check castaway images
# Usage: ./scripts/verify-castaway-images.sh

set -e

echo "🔍 Verifying Castaway Images"
echo ""

# Check if .env exists
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "⚠️  SUPABASE_SERVICE_ROLE_KEY not set, using Supabase CLI..."
  echo ""
fi

echo "📊 Checking database for castaway photo URLs..."
echo ""

# Use Supabase CLI if available, otherwise provide SQL query
if command -v supabase &> /dev/null; then
  echo "Running SQL query via Supabase CLI..."
  supabase db query "
    SELECT 
      name,
      CASE 
        WHEN photo_url IS NULL THEN '❌ Missing'
        WHEN photo_url LIKE '%dicebear%' THEN '⚠️  Placeholder'
        WHEN photo_url LIKE '%supabase.co/storage%' THEN '✅ Storage URL'
        ELSE '❓ Other'
      END as status,
      photo_url
    FROM castaways
    ORDER BY name;
  " 2>/dev/null || echo "⚠️  Could not connect. Run manually in Supabase Dashboard"
else
  echo "💡 Run this SQL query in Supabase Dashboard → SQL Editor:"
  echo ""
  echo "SELECT "
  echo "  name,"
  echo "  CASE "
  echo "    WHEN photo_url IS NULL THEN '❌ Missing'"
  echo "    WHEN photo_url LIKE '%dicebear%' THEN '⚠️  Placeholder'"
  echo "    WHEN photo_url LIKE '%supabase.co/storage%' THEN '✅ Storage URL'"
  echo "    ELSE '❓ Other'"
  echo "  END as status,"
  echo "  photo_url"
  echo "FROM castaways"
  echo "ORDER BY name;"
  echo ""
fi

echo ""
echo "📝 Next steps:"
echo "   1. Check the Castaways page in your app: /castaways"
echo "   2. Verify images load correctly"
echo "   3. If images don't load, check:"
echo "      - Images are uploaded to Supabase Storage bucket 'castaways'"
echo "      - Bucket is set to public"
echo "      - Filenames match the URLs in the database"
echo ""
