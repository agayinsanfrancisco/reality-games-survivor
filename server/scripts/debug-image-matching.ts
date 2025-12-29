/**
 * Debug Image Matching
 * Lists all castaways and all files to see what's not matching
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qxrgejdfxcvsfktgysop.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  // Get all castaways
  const { data: castaways } = await supabase
    .from('castaways')
    .select('id, name, photo_url')
    .order('name');

  // Get all files
  const { data: files } = await supabase.storage
    .from('castaways')
    .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

  console.log('📋 CASTAWAYS IN DATABASE:\n');
  castaways?.forEach((c, i) => {
    console.log(`${(i + 1).toString().padStart(2, ' ')}. ${c.name}`);
    if (c.photo_url) {
      const filename = c.photo_url.split('/').pop();
      console.log(`    Current URL: ${filename}`);
    } else {
      console.log(`    No photo_url`);
    }
  });

  console.log('\n\n📦 FILES IN STORAGE:\n');
  files?.forEach((f, i) => {
    console.log(`${(i + 1).toString().padStart(2, ' ')}. ${f.name}`);
  });

  console.log('\n\n🔍 MATCHING ATTEMPT:\n');
  
  // Try to match
  const fileMap = new Map(files?.map(f => [f.name.toLowerCase(), f.name]) || []);
  
  castaways?.forEach(castaway => {
    const nameLower = castaway.name.toLowerCase();
    const nameParts = nameLower.split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    
    // Try exact match with expected format
    const expected = `${firstName}-${lastName}.jpg`;
    const expected2 = nameLower.replace(/\s+/g, '-') + '.jpg';
    
    let matched = false;
    
    // Check exact matches
    if (fileMap.has(expected)) {
      console.log(`✅ ${castaway.name} → ${fileMap.get(expected)}`);
      matched = true;
    } else if (fileMap.has(expected2)) {
      console.log(`✅ ${castaway.name} → ${fileMap.get(expected2)}`);
      matched = true;
    } else {
      // Try fuzzy match
      for (const [fileKey, actualFile] of fileMap.entries()) {
        const fileBase = fileKey.replace(/\.(jpg|jpeg|png|webp)$/i, '');
        const fileParts = fileBase.split('-');
        
        if (fileParts.includes(firstName) && fileParts.includes(lastName)) {
          console.log(`🔗 ${castaway.name} → ${actualFile} (fuzzy)`);
          matched = true;
          break;
        }
      }
    }
    
    if (!matched) {
      console.log(`❌ ${castaway.name} → NO MATCH`);
      console.log(`   Expected: ${expected} or ${expected2}`);
    }
  });
}

main().catch(console.error);
