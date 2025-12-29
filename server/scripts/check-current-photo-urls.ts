/**
 * Check Current Photo URLs
 * Shows what photo_url values are currently in the database
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
  const { data: castaways } = await supabase
    .from('castaways')
    .select('name, photo_url')
    .order('name');

  console.log('📋 Current photo_url values in database:\n');
  
  castaways?.forEach(c => {
    const filename = c.photo_url?.split('/').pop() || 'NULL';
    const isSupabaseUrl = c.photo_url?.includes('supabase.co/storage');
    const isDiceBear = c.photo_url?.includes('dicebear.com');
    
    let status = '❓';
    if (!c.photo_url) status = '❌ NULL';
    else if (isDiceBear) status = '🎲 DiceBear';
    else if (isSupabaseUrl) status = '✅ Supabase';
    else status = '❓ Other';
    
    console.log(`${status} ${c.name.padEnd(25)} → ${filename}`);
  });
}

main().catch(console.error);
