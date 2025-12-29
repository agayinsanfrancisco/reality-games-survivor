/**
 * Diagnose Castaway Images
 * 
 * Checks why castaway images might not be loading:
 * 1. Verifies database has photo_url values
 * 2. Tests if images are accessible in Supabase Storage
 * 3. Checks bucket permissions
 * 
 * Usage: npx tsx server/scripts/diagnose-castaway-images.ts
 */

import { createClient } from '@supabase/supabase-js';

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

async function testImageUrl(url: string): Promise<{ accessible: boolean; status?: number; error?: string }> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return {
      accessible: response.ok,
      status: response.status,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error: any) {
    return {
      accessible: false,
      error: error.message || 'Network error',
    };
  }
}

async function main() {
  console.log('🔍 Diagnosing Castaway Images\n');
  console.log(`📦 Storage Bucket: ${STORAGE_BUCKET}`);
  console.log(`🔗 Base URL: ${BASE_URL}\n`);

  // 1. Check database
  console.log('1️⃣  Checking database...');
  const { data: castaways, error: dbError } = await supabase
    .from('castaways')
    .select('id, name, photo_url')
    .order('name')
    .limit(5);

  if (dbError) {
    console.error('   ❌ Database error:', dbError);
    return;
  }

  if (!castaways || castaways.length === 0) {
    console.error('   ❌ No castaways found');
    return;
  }

  console.log(`   ✅ Found ${castaways.length} castaways (showing first 5)`);
  
  const withPhotos = castaways.filter(c => c.photo_url);
  const withoutPhotos = castaways.filter(c => !c.photo_url);
  
  console.log(`   📊 ${withPhotos.length} with photo_url, ${withoutPhotos.length} without\n`);

  if (withPhotos.length === 0) {
    console.log('   ⚠️  No castaways have photo_url set in database!');
    console.log('   💡 Run: npx tsx server/scripts/attach-castaway-images.ts\n');
    return;
  }

  // 2. Check storage bucket
  console.log('2️⃣  Checking storage bucket...');
  const { data: files, error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list('', { limit: 10 });

  if (storageError) {
    console.error('   ❌ Storage error:', storageError.message);
    console.log('   💡 Possible issues:');
    console.log('      - Bucket does not exist');
    console.log('      - Service role key lacks storage permissions');
    console.log('      - Bucket is private (should be public)\n');
  } else {
    console.log(`   ✅ Found ${files?.length || 0} files in storage`);
    if (files && files.length > 0) {
      console.log('   📁 Sample files:');
      files.slice(0, 5).forEach(file => {
        console.log(`      - ${file.name}`);
      });
    } else {
      console.log('   ⚠️  No files found in storage bucket!');
      console.log('   💡 Upload images to Supabase Storage → castaways bucket\n');
    }
  }

  // 3. Test image URLs
  console.log('\n3️⃣  Testing image URLs...');
  const sampleCastaway = withPhotos[0];
  if (sampleCastaway && sampleCastaway.photo_url) {
    console.log(`   Testing: ${sampleCastaway.name}`);
    console.log(`   URL: ${sampleCastaway.photo_url}`);
    
    const testResult = await testImageUrl(sampleCastaway.photo_url);
    
    if (testResult.accessible) {
      console.log(`   ✅ Image is accessible (HTTP ${testResult.status})`);
    } else {
      console.log(`   ❌ Image is NOT accessible: ${testResult.error}`);
      console.log('   💡 Possible issues:');
      console.log('      - File not uploaded to storage');
      console.log('      - Filename mismatch');
      console.log('      - Bucket is not public');
      console.log('      - CORS configuration issue');
    }
  }

  // 4. Check bucket public access
  console.log('\n4️⃣  Checking bucket configuration...');
  console.log('   💡 In Supabase Dashboard:');
  console.log('      1. Go to Storage → castaways bucket');
  console.log('      2. Check Settings → Public bucket (should be ON)');
  console.log('      3. Verify files are in the root of the bucket (not in subfolders)');

  // 5. Sample URLs to check
  console.log('\n5️⃣  Sample URLs to verify manually:');
  withPhotos.slice(0, 3).forEach(castaway => {
    if (castaway.photo_url) {
      console.log(`   ${castaway.name}:`);
      console.log(`   ${castaway.photo_url}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('📋 Summary:');
  console.log(`   Castaways with photo_url: ${withPhotos.length}`);
  console.log(`   Files in storage: ${files?.length || 0}`);
  if (sampleCastaway?.photo_url) {
    const testResult = await testImageUrl(sampleCastaway.photo_url);
    console.log(`   Sample image accessible: ${testResult.accessible ? '✅ Yes' : '❌ No'}`);
  }
  console.log('='.repeat(60));
}

main().catch(console.error);
