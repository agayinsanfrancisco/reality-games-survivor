/**
 * Match Storage Files to Castaways
 * 
 * Lists files from Supabase Storage and matches them to castaways in the database.
 * Updates photo_url to use the actual filenames from storage.
 * 
 * Usage:
 *   npx tsx server/scripts/match-storage-files-to-castaways.ts
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
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Convert filename to potential castaway name
 */
function filenameToName(filename: string): string {
  return filename
    .replace(/\.(jpg|jpeg|png|webp)$/i, '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

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
 * Calculate similarity score between filename and castaway name
 */
function calculateSimilarity(filename: string, castawayName: string): number {
  const filenameClean = filename.toLowerCase().replace(/\.(jpg|jpeg|png|webp)$/i, '');
  const nameClean = castawayName.toLowerCase();
  
  // Exact match
  if (filenameClean === nameToFilename(castawayName).replace('.jpg', '')) {
    return 100;
  }
  
  // Try reverse conversion
  const reverseName = filenameToName(filename);
  if (reverseName.toLowerCase() === nameClean) {
    return 95;
  }
  
  // Check if all words from name are in filename
  const nameWords = nameClean.split(/\s+/).filter(w => w.length > 1);
  const filenameWords = filenameClean.split('-');
  
  let matchingWords = 0;
  for (const nameWord of nameWords) {
    if (filenameWords.some(fw => fw.includes(nameWord) || nameWord.includes(fw))) {
      matchingWords++;
    }
  }
  
  return (matchingWords / nameWords.length) * 80;
}

async function main() {
  console.log('🔄 Matching Storage Files to Castaways\n');
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
    console.error('   Check bucket permissions and service role key');
    process.exit(1);
  }

  if (!storageFiles || storageFiles.length === 0) {
    console.error('❌ No files found in storage');
    return;
  }

  console.log(`   Found ${storageFiles.length} files in storage\n`);

  // Match files to castaways
  console.log('🔗 Matching files to castaways...\n');
  const matches: Array<{
    castaway: typeof castaways[0];
    file: typeof storageFiles[0];
    score: number;
    url: string;
  }> = [];
  
  const usedCastawayIds = new Set<string>();
  const usedFileNames = new Set<string>();

  // First pass: exact matches
  for (const file of storageFiles) {
    if (usedFileNames.has(file.name)) continue;
    
    for (const castaway of castaways) {
      if (usedCastawayIds.has(castaway.id)) continue;
      
      const score = calculateSimilarity(file.name, castaway.name);
      if (score >= 90) {
        matches.push({
          castaway,
          file,
          score,
          url: `${BASE_URL}/${file.name}`,
        });
        usedCastawayIds.add(castaway.id);
        usedFileNames.add(file.name);
        break;
      }
    }
  }

  // Second pass: fuzzy matches
  for (const file of storageFiles) {
    if (usedFileNames.has(file.name)) continue;
    
    let bestMatch: { castaway: typeof castaways[0]; score: number } | null = null;
    
    for (const castaway of castaways) {
      if (usedCastawayIds.has(castaway.id)) continue;
      
      const score = calculateSimilarity(file.name, castaway.name);
      if (score >= 70 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { castaway, score };
      }
    }

    if (bestMatch) {
      matches.push({
        castaway: bestMatch.castaway,
        file,
        score: bestMatch.score,
        url: `${BASE_URL}/${file.name}`,
      });
      usedCastawayIds.add(bestMatch.castaway.id);
      usedFileNames.add(file.name);
    }
  }

  // Show matches
  console.log('✅ Matched Castaways:\n');
  matches
    .sort((a, b) => a.castaway.name.localeCompare(b.castaway.name))
    .forEach(({ castaway, file, url, score }) => {
      const currentUrl = castaway.photo_url;
      const needsUpdate = currentUrl !== url;
      const status = needsUpdate ? '🔄' : '✅';
      const scoreEmoji = score >= 95 ? '🎯' : score >= 80 ? '✅' : '⚠️';
      console.log(`${status} ${scoreEmoji} ${castaway.name} (${score}% match)`);
      console.log(`   File: ${file.name}`);
      console.log(`   URL:  ${url}`);
      if (currentUrl && currentUrl !== url) {
        console.log(`   Current: ${currentUrl.substring(0, 80)}...`);
      }
      console.log('');
    });

  // Unmatched
  const unmatchedFiles = storageFiles.filter(f => !usedFileNames.has(f.name));
  const unmatchedCastaways = castaways.filter(c => !usedCastawayIds.has(c.id));

  if (unmatchedFiles.length > 0) {
    console.log(`\n📁 Unmatched Files (${unmatchedFiles.length}):\n`);
    unmatchedFiles.forEach(file => {
      console.log(`   ${file.name}`);
    });
    console.log('');
  }

  if (unmatchedCastaways.length > 0) {
    console.log(`\n⚠️  Unmatched Castaways (${unmatchedCastaways.length}):\n`);
    unmatchedCastaways.forEach(castaway => {
      const expected = nameToFilename(castaway.name);
      console.log(`   ${castaway.name}`);
      console.log(`   Expected filename: ${expected}`);
    });
    console.log('');
  }

  // Update database
  const needsUpdate = matches.filter(m => m.castaway.photo_url !== m.url);
  
  if (needsUpdate.length > 0) {
    console.log(`\n💾 Ready to update ${needsUpdate.length} castaways...`);
    console.log('   Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('💾 Updating database...\n');
    
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
  } else {
    console.log('\n✅ All castaways already have correct URLs!\n');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   Total castaways: ${castaways.length}`);
  console.log(`   Files in storage: ${storageFiles.length}`);
  console.log(`   Matched: ${matches.length}`);
  console.log(`   Updated: ${needsUpdate.length}`);
  console.log(`   Unmatched files: ${unmatchedFiles.length}`);
  console.log(`   Unmatched castaways: ${unmatchedCastaways.length}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
