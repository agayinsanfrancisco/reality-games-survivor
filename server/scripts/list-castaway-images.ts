/**
 * List Castaway Images Script
 *
 * This script lists all castaways in the database and their expected image filenames.
 * Use this to verify which images you need to upload to Supabase Storage.
 *
 * Usage:
 *   npx tsx server/scripts/list-castaway-images.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qxrgejdfxcvsfktgysop.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = 'qxrgejdfxcvsfktgysop';
const STORAGE_BUCKET = 'castaways';
const BASE_URL = `https://${PROJECT_REF}.supabase.co/storage/v1/object/public/${STORAGE_BUCKET}`;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Convert castaway name to filename format
 */
function nameToFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    + '.jpg';
}

async function main() {
  console.log('📸 Castaway Image Filename Reference\n');
  console.log(`📦 Storage Bucket: ${STORAGE_BUCKET}`);
  console.log(`🔗 Base URL: ${BASE_URL}\n`);

  // Get all castaways grouped by season
  const { data: castaways, error } = await supabase
    .from('castaways')
    .select('id, name, photo_url, season_id, seasons(number, name)')
    .order('name');

  if (error) {
    console.error('❌ Error fetching castaways:', error);
    process.exit(1);
  }

  if (!castaways || castaways.length === 0) {
    console.log('⚠️  No castaways found in database');
    return;
  }

  // Group by season
  const bySeason = new Map<string, typeof castaways>();
  for (const castaway of castaways) {
    const seasonId = castaway.season_id;
    if (!bySeason.has(seasonId)) {
      bySeason.set(seasonId, []);
    }
    bySeason.get(seasonId)!.push(castaway);
  }

  // Print for each season
  for (const [seasonId, seasonCastaways] of bySeason) {
    const season = seasonCastaways[0].seasons as { number: number; name: string } | null;
    const seasonName = season ? `Season ${season.number}: ${season.name}` : `Season ${seasonId}`;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${seasonName}`);
    console.log(`${'='.repeat(60)}\n`);

    seasonCastaways.forEach((castaway, index) => {
      const filename = nameToFilename(castaway.name);
      const url = `${BASE_URL}/${filename}`;
      const hasPhoto = castaway.photo_url ? '✅' : '❌';
      
      console.log(`${(index + 1).toString().padStart(3, ' ')}. ${hasPhoto} ${castaway.name}`);
      console.log(`      File: ${filename}`);
      console.log(`      URL:  ${url}`);
      
      if (castaway.photo_url && castaway.photo_url !== url) {
        console.log(`      ⚠️  Current URL differs: ${castaway.photo_url}`);
      }
      console.log('');
    });
  }

  // Summary
  const total = castaways.length;
  const withPhotos = castaways.filter(c => c.photo_url).length;
  const missingPhotos = total - withPhotos;

  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 Summary:');
  console.log(`   Total castaways: ${total}`);
  console.log(`   With photos: ${withPhotos}`);
  console.log(`   Missing photos: ${missingPhotos}`);
  console.log(`   Seasons: ${bySeason.size}`);
  console.log(`${'='.repeat(60)}\n`);

  if (missingPhotos > 0) {
    console.log('📝 Next steps:');
    console.log(`   1. Upload ${missingPhotos} missing images to Supabase Storage bucket "${STORAGE_BUCKET}"`);
    console.log('   2. Run: npx tsx server/scripts/attach-castaway-images.ts');
    console.log('   3. Or use: ./scripts/update-castaway-images.sh\n');
  }
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
