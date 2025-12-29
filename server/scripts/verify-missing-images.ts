/**
 * Verify Missing Images
 * Checks which castaway images are missing from storage
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qxrgejdfxcvsfktgysop.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STORAGE_BUCKET = 'castaways';

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  // Get all castaways
  const { data: castaways } = await supabase
    .from('castaways')
    .select('name, photo_url')
    .order('name');

  // Get all files
  const { data: files } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list('', { limit: 1000 });

  const fileSet = new Set(files?.map(f => f.name.toLowerCase()) || []);

  console.log('🔍 Checking which images are missing from storage:\n');
  
  const missing: string[] = [];
  const found: string[] = [];

  castaways?.forEach(c => {
    const expectedUrl = c.photo_url;
    if (!expectedUrl) {
      missing.push(`${c.name} (no photo_url in database)`);
      return;
    }

    const filename = expectedUrl.split('/').pop();
    if (!filename) {
      missing.push(`${c.name} (invalid URL)`);
      return;
    }

    if (fileSet.has(filename.toLowerCase())) {
      found.push(c.name);
      console.log(`✅ ${c.name.padEnd(25)} → ${filename}`);
    } else {
      missing.push(c.name);
      console.log(`❌ ${c.name.padEnd(25)} → ${filename} (MISSING)`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Summary:`);
  console.log(`   Total castaways: ${castaways?.length || 0}`);
  console.log(`   Images found: ${found.length}`);
  console.log(`   Images missing: ${missing.length}`);
  console.log('='.repeat(60));

  if (missing.length > 0) {
    console.log('\n📋 Missing images (upload these to Supabase Storage):\n');
    missing.forEach(name => {
      const castaway = castaways?.find(c => c.name === name);
      const filename = castaway?.photo_url?.split('/').pop() || 'unknown.jpg';
      console.log(`   ${filename}`);
    });
  }
}

main().catch(console.error);
