/**
 * Fix All Castaway Images
 * 
 * This script matches actual filenames from Supabase Storage to ALL castaways
 * in the database and updates their photo_url fields.
 * 
 * Usage:
 *   export SUPABASE_SERVICE_ROLE_KEY='your-key'
 *   npx tsx server/scripts/fix-all-castaway-images.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qxrgejdfxcvsfktgysop.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = 'qxrgejdfxcvsfktgysop';
const STORAGE_BUCKET = 'castaways';
const BASE_URL = `https://${PROJECT_REF}.supabase.co/storage/v1/object/public/${STORAGE_BUCKET}`;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Set it with: export SUPABASE_SERVICE_ROLE_KEY=\'your-key\'');
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

/**
 * Manual mappings for known filename variations
 */
const manualMappings: Record<string, string> = {
  'tiffany-ervin.jpg': 'Tiffany Nicole Ervin',
  'stephenie-lagrossa.jpg': 'Stephenie LaGrossa Kendrick',
  'jenna-lewis.jpg': 'Jenna Lewis-Dougherty',
  // Add more as needed
};

async function main() {
  console.log('🖼️  Fixing All Castaway Images\n');
  console.log(`📦 Storage Bucket: ${STORAGE_BUCKET}`);
  console.log(`🔗 Base URL: ${BASE_URL}\n`);

  // Get all castaways
  console.log('📋 Fetching castaways from database...');
  const { data: castaways, error: dbError } = await supabase
    .from('castaways')
    .select('id, name, photo_url, season_id')
    .order('name');

  if (dbError) {
    console.error('❌ Database error:', dbError);
    process.exit(1);
  }

  if (!castaways || castaways.length === 0) {
    console.error('❌ No castaways found');
    return;
  }

  console.log(`   Found ${castaways.length} castaways\n`);

  // List files from storage
  console.log('📦 Listing files from Supabase Storage...');
  const { data: storageFiles, error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

  if (storageError) {
    console.error('❌ Storage error:', storageError);
    console.log('\n💡 Will use expected filenames based on castaway names...\n');
  }

  const files = storageFiles || [];
  console.log(`   Found ${files.length} files in storage\n`);

  // Create file map
  const fileMap = new Map<string, string>();
  for (const file of files) {
    fileMap.set(file.name.toLowerCase(), file.name);
  }

  // Match and update all castaways
  console.log('🔗 Matching castaways to files...\n');
  const updates: Array<{ castaway: typeof castaways[0]; filename: string; url: string }> = [];

  for (const castaway of castaways) {
    let filename: string | null = null;
    let url: string | null = null;

    // Try manual mapping first
    for (const [fileKey, castawayName] of Object.entries(manualMappings)) {
      if (castaway.name === castawayName) {
        if (fileMap.has(fileKey.toLowerCase())) {
          filename = fileMap.get(fileKey.toLowerCase())!;
          url = `${BASE_URL}/${filename}`;
          break;
        }
      }
    }

    // Try expected filename
    if (!filename) {
      const expectedFilename = nameToFilename(castaway.name);
      if (fileMap.has(expectedFilename.toLowerCase())) {
        filename = fileMap.get(expectedFilename.toLowerCase())!;
        url = `${BASE_URL}/${filename}`;
      }
    }

    // Try fuzzy match (check if any file contains key parts of name)
    if (!filename) {
      const nameParts = castaway.name.toLowerCase().split(/\s+/);
      for (const [fileKey, actualFilename] of fileMap.entries()) {
        const fileKeyParts = fileKey.replace(/\.(jpg|jpeg|png|webp)$/i, '').split('-');
        // Check if first and last name parts match
        if (nameParts.length >= 2) {
          const firstName = nameParts[0];
          const lastName = nameParts[nameParts.length - 1];
          if (fileKeyParts.includes(firstName) && fileKeyParts.includes(lastName)) {
            filename = actualFilename;
            url = `${BASE_URL}/${filename}`;
            break;
          }
        }
      }
    }

    if (filename && url) {
      updates.push({ castaway, filename, url });
    }
  }

  // Show what will be updated
  console.log(`📸 Found ${updates.length} matches:\n`);
  updates.forEach(({ castaway, filename, url }) => {
    const currentUrl = castaway.photo_url;
    const needsUpdate = currentUrl !== url;
    const status = needsUpdate ? '🔄' : '✅';
    console.log(`${status} ${castaway.name}`);
    console.log(`   File: ${filename}`);
    console.log(`   URL:  ${url}`);
    if (currentUrl && currentUrl !== url) {
      console.log(`   Current: ${currentUrl.substring(0, 60)}...`);
    }
    console.log('');
  });

  const needsUpdate = updates.filter(u => u.castaway.photo_url !== u.url);
  
  if (needsUpdate.length === 0) {
    console.log('✅ All castaways already have correct URLs!\n');
    return;
  }

  // Show unmatched
  const matchedIds = new Set(updates.map(u => u.castaway.id));
  const unmatched = castaways.filter(c => !matchedIds.has(c.id));
  
  if (unmatched.length > 0) {
    console.log(`\n⚠️  ${unmatched.length} castaways without matching files:\n`);
    unmatched.forEach(castaway => {
      const expected = nameToFilename(castaway.name);
      console.log(`   ${castaway.name}`);
      console.log(`   Expected: ${expected}\n`);
    });
  }

  // Update database
  console.log(`\n💾 Updating ${needsUpdate.length} castaways...\n`);
  
  for (const { castaway, url } of needsUpdate) {
    const { error } = await supabase
      .from('castaways')
      .update({ photo_url: url })
      .eq('id', castaway.id);

    if (error) {
      console.error(`   ❌ ${castaway.name}: ${error.message}`);
    } else {
      console.log(`   ✅ ${castaway.name}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   Total castaways: ${castaways.length}`);
  console.log(`   Files in storage: ${files.length}`);
  console.log(`   Matched: ${updates.length}`);
  console.log(`   Updated: ${needsUpdate.length}`);
  console.log(`   Unmatched: ${unmatched.length}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
