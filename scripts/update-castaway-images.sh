#!/bin/bash

# Update Castaway Images Script
# 
# This script helps you attach castaway images to database records.
# It runs the TypeScript script that updates photo_url fields.
#
# Usage:
#   ./scripts/update-castaway-images.sh
#
# Prerequisites:
#   1. Images uploaded to Supabase Storage bucket "castaways"
#   2. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set in .env

set -e

echo "🖼️  Updating Castaway Images"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
  echo "⚠️  Warning: .env file not found"
  echo "   Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set"
  echo ""
fi

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Check required environment variables
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY not set"
  echo "   Set it in your .env file or export it:"
  echo "   export SUPABASE_SERVICE_ROLE_KEY='your-key-here'"
  exit 1
fi

# Run the TypeScript script
echo "🚀 Running attach-castaway-images script..."
echo ""

cd server
npx tsx scripts/attach-castaway-images.ts

echo ""
echo "✅ Done!"
