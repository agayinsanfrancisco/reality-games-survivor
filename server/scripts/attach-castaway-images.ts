/**
 * Attach Castaway Images Script
 *
 * This script matches uploaded castaway images to their database records
 * and updates the photo_url field with Supabase Storage URLs.
 *
 * Usage:
 *   npx tsx server/scripts/attach-castaway-images.ts
 *
 * Prerequisites:
 *   1. Images must be uploaded to Supabase Storage bucket "castaways"
 *   2. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qxrgejdfxcvsfktgysop.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = 'qxrgejdfxcvsfktgysop';
const STORAGE_BUCKET = 'castaways';
const BASE_URL = `https://${PROJECT_REF}.supabase.co/storage/v1/object/public/${STORAGE_BUCKET}`;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.error('   Set it in your .env file or export it before running this script');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Convert castaway name to filename format
 * Examples:
 *   "Rob Mariano" -> "rob-mariano.jpg"
 *   "Sandra Diaz-Twine" -> "sandra-diaz-twine.jpg"
 */
function nameToFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    + '.jpg';
}

/**
 * Convert filename to potential castaway name (reverse of nameToFilename)
 */
function filenameToName(filename: string): string {
  return filename
    .replace(/\.(jpg|jpeg|png|webp)$/i, '') // Remove extension
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * List all files in Supabase Storage bucket
 */
async function listStorageFiles() {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      console.error('❌ Error listing storage files:', error);
      console.error('   This might be a permissions issue. Check:');
      console.error('   1. Bucket exists and is accessible');
      console.error('   2. Service role key has storage permissions');
      console.error('   3. Files might be in a subfolder (not supported yet)');
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('❌ Failed to list storage files:', err);
    console.log('\n💡 Tip: If images are in a subfolder, you may need to:');
    console.log('   1. Move them to the root of the bucket, or');
    console.log('   2. Update the script to handle subfolders');
    throw err;
  }
}

/**
 * Match filename to castaway name (fuzzy matching)
 */
function matchFilenameToCastaway(filename: string, castawayName: string): boolean {
  const expectedFilename = nameToFilename(castawayName);
  const filenameLower = filename.toLowerCase();
  const expectedLower = expectedFilename.toLowerCase();
  
  // Exact match
  if (filenameLower === expectedLower) return true;
  
  // Match without extension
  if (filenameLower.replace(/\.(jpg|jpeg|png|webp)$/i, '') === expectedLower.replace(/\.(jpg|jpeg|png|webp)$/i, '')) {
    return true;
  }
  
  // Try reverse conversion
  const reverseName = filenameToName(filename);
  if (reverseName.toLowerCase() === castawayName.toLowerCase()) {
    return true;
  }
  
  return false;
}

/**
 * Get all castaways from database
 */
async function getCastaways() {
  const { data, error } = await supabase
    .from('castaways')
    .select('id, name, photo_url, season_id')
    .order('name');

  if (error) {
    console.error('❌ Error fetching castaways:', error);
    throw error;
  }

  return data || [];
}

/**
 * Update castaway photo URL
 */
async function updateCastawayPhoto(castawayId: string, photoUrl: string) {
  const { error } = await supabase
    .from('castaways')
    .update({ photo_url: photoUrl })
    .eq('id', castawayId);

  if (error) {
    console.error(`❌ Error updating ${castawayId}:`, error);
    throw error;
  }
}

/**
 * Generate SQL migration file
 */
function generateMigrationSQL(updates: Array<{ name: string; photoUrl: string }>) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const migrationName = `013_attach_castaway_images_${timestamp}`;
  // Get project root (go up from server/scripts to project root)
  // process.cwd() when run from server/ will be server/, so go up one level
  const cwd = process.cwd();
  const isInServerDir = cwd.endsWith('server');
  const projectRoot = isInServerDir ? path.resolve(cwd, '..') : cwd;
  const migrationPath = path.join(projectRoot, 'supabase', 'migrations', `${migrationName}.sql`);
  
  // Ensure migrations directory exists
  const migrationsDir = path.dirname(migrationPath);
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    console.log(`   Created migrations directory: ${migrationsDir}`);
  }

  const sql = `-- ============================================
-- ATTACH CASTAWAY IMAGES
-- Migration ${migrationName}: Update castaway photo URLs
-- ============================================

-- Base URL for Supabase storage
-- Format: https://{project_ref}.supabase.co/storage/v1/object/public/{bucket}/{path}

${updates.map(({ name, photoUrl }) => 
  `UPDATE castaways SET photo_url = '${photoUrl}' WHERE name = '${name.replace(/'/g, "''")}';`
).join('\n')}

-- Verify update
SELECT name, photo_url FROM castaways WHERE photo_url IS NOT NULL ORDER BY name;
`;

  fs.writeFileSync(migrationPath, sql);
  console.log(`\n📄 SQL migration generated: ${migrationPath}`);
  return migrationPath;
}

/**
 * Main function
 */
async function main() {
  console.log('🖼️  Attaching Castaway Images\n');
  console.log(`📦 Storage Bucket: ${STORAGE_BUCKET}`);
  console.log(`🔗 Base URL: ${BASE_URL}\n`);

  // Get all castaways
  console.log('📋 Fetching castaways from database...');
  const castaways = await getCastaways();
  console.log(`   Found ${castaways.length} castaways\n`);

  // List files from Supabase Storage
  console.log('📦 Listing files from Supabase Storage...');
  let storageFiles;
  try {
    storageFiles = await listStorageFiles();
    console.log(`   Found ${storageFiles.length} files in storage`);
    
    if (storageFiles.length > 0) {
      console.log('   Sample files:');
      storageFiles.slice(0, 5).forEach(file => {
        console.log(`      - ${file.name}`);
      });
      if (storageFiles.length > 5) {
        console.log(`      ... and ${storageFiles.length - 5} more`);
      }
    }
    
    if (storageFiles.length === 0) {
      console.log('\n⚠️  No files found in storage bucket. This might be:');
      console.log('   1. Files are in a subfolder (script only checks root level)');
      console.log('   2. Bucket name is incorrect (expected: "castaways")');
      console.log('   3. Permission issue with service role key');
      console.log('   4. Files haven\'t been uploaded yet');
      console.log('\n💡 Continuing anyway - will use expected filenames based on castaway names...');
      console.log('   The script will still update the database with expected URLs.\n');
    }
  } catch (error) {
    console.error('\n⚠️  Could not list files from storage. This might be:');
    console.error('   1. Permission issue with service role key');
    console.error('   2. Files are in a subfolder (script only checks root)');
    console.error('   3. Bucket name is incorrect');
    console.error('\n💡 Continuing anyway - will use expected filenames based on castaway names...\n');
    storageFiles = [];
  }

  // Create a map of filenames to storage file objects
  const fileMap = new Map<string, typeof storageFiles[0]>();
  for (const file of storageFiles) {
    fileMap.set(file.name.toLowerCase(), file);
  }

  // Match castaways to storage files
  const updates: Array<{ id: string; name: string; photoUrl: string; currentUrl: string | null; matched: boolean }> = [];
  const unmatchedFiles: string[] = [];
  const matchedFiles = new Set<string>();
  
  for (const castaway of castaways) {
    const expectedFilename = nameToFilename(castaway.name);
    let matchedFile: typeof storageFiles[0] | null = null;
    
    // Try exact match first
    if (fileMap.has(expectedFilename.toLowerCase())) {
      matchedFile = fileMap.get(expectedFilename.toLowerCase())!;
    } else {
      // Try fuzzy matching
      for (const [filename, file] of fileMap.entries()) {
        if (matchFilenameToCastaway(filename, castaway.name)) {
          matchedFile = file;
          break;
        }
      }
    }
    
    if (matchedFile) {
      const photoUrl = `${BASE_URL}/${matchedFile.name}`;
      matchedFiles.add(matchedFile.name.toLowerCase());
      updates.push({
        id: castaway.id,
        name: castaway.name,
        photoUrl,
        currentUrl: castaway.photo_url,
        matched: true,
      });
    } else {
      // No match found - use expected filename anyway (might be uploaded later)
      const photoUrl = `${BASE_URL}/${expectedFilename}`;
      updates.push({
        id: castaway.id,
        name: castaway.name,
        photoUrl,
        currentUrl: castaway.photo_url,
        matched: false,
      });
    }
  }

  // Find unmatched files
  for (const file of storageFiles) {
    if (!matchedFiles.has(file.name.toLowerCase())) {
      unmatchedFiles.push(file.name);
    }
  }

  // Show what will be updated
  console.log('📸 Castaway Image Mapping:\n');
  // Update all castaways that don't have the correct URL (even if file not found in storage)
  const needsUpdate = updates.filter(u => u.currentUrl !== u.photoUrl);
  const alreadySet = updates.filter(u => u.currentUrl === u.photoUrl);
  const missing = updates.filter(u => !u.matched);

  if (needsUpdate.length > 0) {
    console.log(`🔄 Will update ${needsUpdate.length} castaways:\n`);
    needsUpdate.forEach(({ name, photoUrl, currentUrl }) => {
      console.log(`   ${name}`);
      console.log(`      Current: ${currentUrl || '(none)'}`);
      console.log(`      New:     ${photoUrl}\n`);
    });
  }

  if (alreadySet.length > 0) {
    console.log(`✅ ${alreadySet.length} castaways already have correct URLs\n`);
  }

  if (missing.length > 0) {
    console.log(`⚠️  ${missing.length} castaways missing photos in storage:\n`);
    missing.forEach(({ name, photoUrl }) => {
      console.log(`   ${name}`);
      console.log(`      Expected: ${photoUrl}\n`);
    });
  }

  if (unmatchedFiles.length > 0) {
    console.log(`📁 ${unmatchedFiles.length} files in storage not matched to castaways:\n`);
    unmatchedFiles.forEach(filename => {
      console.log(`   ${filename}\n`);
    });
  }

  // Ask for confirmation (in a real script, you might want to use readline)
  console.log('\n⚠️  Ready to update database.');
  console.log('   This will update the photo_url field for all castaways.');
  console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  // Update database
  console.log('💾 Updating database...\n');
  let updated = 0;
  let errors = 0;

  for (const update of needsUpdate) {
    try {
      await updateCastawayPhoto(update.id, update.photoUrl);
      console.log(`   ✅ ${update.name}`);
      updated++;
    } catch (error) {
      console.error(`   ❌ ${update.name}: ${error}`);
      errors++;
    }
  }

  // Generate SQL migration file
  console.log('\n📄 Generating SQL migration file...');
  const allUpdates = updates.map(({ name, photoUrl }) => ({ name, photoUrl }));
  generateMigrationSQL(allUpdates);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`   Total castaways: ${castaways.length}`);
  console.log(`   Files in storage: ${storageFiles.length}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Already correct: ${alreadySet.length}`);
  console.log(`   Missing photos: ${missing.length}`);
  console.log(`   Unmatched files: ${unmatchedFiles.length}`);
  console.log(`   Errors: ${errors}`);
  console.log('='.repeat(50));

  if (errors > 0) {
    console.error('\n❌ Some updates failed. Check the errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ All castaway images attached successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Verify images are uploaded to Supabase Storage bucket "castaways"');
    console.log('   2. Check the generated SQL migration file');
    console.log('   3. Run: npx supabase db push (if you want to apply via migration)');
  }
}

// Run the script
main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
