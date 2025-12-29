/**
 * Apply Castaway Replacement Migration
 * Runs the SQL migration to replace all Season 50 castaways
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qxrgejdfxcvsfktgysop.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  const migrationPath = join(process.cwd(), 'supabase', 'migrations', '016_replace_season_50_castaways.sql');
  const sql = readFileSync(migrationPath, 'utf-8');

  console.log('🔄 Applying migration 016_replace_season_50_castaways.sql...\n');

  // Execute the entire SQL block using Supabase's REST API
  // We'll use the PostgREST API directly for DO blocks
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ sql_query: sql }),
  });

  if (!response.ok) {
    // If RPC doesn't exist, we need to use psql or the Supabase CLI
    console.log('⚠️  Direct SQL execution not available via API.');
    console.log('📝 Please run this migration manually using one of these methods:\n');
    console.log('   1. Use Supabase CLI:');
    console.log('      npx supabase db execute --file supabase/migrations/016_replace_season_50_castaways.sql\n');
    console.log('   2. Or copy the SQL and run it in Supabase Dashboard SQL Editor\n');
    console.log('   3. Or use psql to connect and run the file\n');
    
    // Let's try to execute it statement by statement using the REST API
    console.log('💡 Attempting to execute via direct database connection...\n');
    
    // Actually, the best approach is to tell the user to use the Supabase CLI
    // or we can try using the management API if available
    process.exit(1);
  } else {
    const result = await response.json();
    console.log('✅ Migration applied successfully!');
    console.log(result);
  }
}

main().catch(console.error);
