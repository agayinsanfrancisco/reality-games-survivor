#!/usr/bin/env node

/**
 * Helper script to match uploaded castaway images to their database records
 * 
 * This script shows the expected image filenames for castaways.
 * For a dynamic version that reads from the database, use:
 *   npx tsx server/scripts/list-castaway-images.ts
 * 
 * Usage:
 *   node scripts/match-castaway-images.js
 * 
 * Note: This is a static reference. For Season 50 castaways from the database,
 * use the TypeScript script instead.
 */

// Season 50 castaways (from seed_season_50.sql)
const season50Castaways = [
  { name: 'Rob Mariano', filename: 'rob-mariano.jpg' },
  { name: 'Sandra Diaz-Twine', filename: 'sandra-diaz-twine.jpg' },
  { name: 'Tony Vlachos', filename: 'tony-vlachos.jpg' },
  { name: 'Cirie Fields', filename: 'cirie-fields.jpg' },
  { name: 'Tyson Apostol', filename: 'tyson-apostol.jpg' },
  { name: 'Sarah Lacina', filename: 'sarah-lacina.jpg' },
  { name: 'Ben Driebergen', filename: 'ben-driebergen.jpg' },
  { name: 'Natalie Anderson', filename: 'natalie-anderson.jpg' },
  { name: 'Parvati Shallow', filename: 'parvati-shallow.jpg' },
  { name: 'Kim Spradlin-Wolfe', filename: 'kim-spradlin-wolfe.jpg' },
  { name: 'Jeremy Collins', filename: 'jeremy-collins.jpg' },
  { name: 'Michele Fitzgerald', filename: 'michele-fitzgerald.jpg' },
  { name: 'Wendell Holland', filename: 'wendell-holland.jpg' },
  { name: 'Sophie Clarke', filename: 'sophie-clarke.jpg' },
  { name: 'Yul Kwon', filename: 'yul-kwon.jpg' },
  { name: 'Denise Stapley', filename: 'denise-stapley.jpg' },
  { name: 'Ethan Zohn', filename: 'ethan-zohn.jpg' },
  { name: 'Tina Wesson', filename: 'tina-wesson.jpg' },
  { name: 'Earl Cole', filename: 'earl-cole.jpg' },
  { name: 'JT Thomas', filename: 'jt-thomas.jpg' },
  { name: 'Vecepia Towery', filename: 'vecepia-towery.jpg' },
  { name: 'Danni Boatwright', filename: 'danni-boatwright.jpg' },
  { name: 'Adam Klein', filename: 'adam-klein.jpg' },
  { name: 'Nick Wilson', filename: 'nick-wilson.jpg' },
];

const PROJECT_REF = 'qxrgejdfxcvsfktgysop';
const STORAGE_BUCKET = 'castaways';
const BASE_URL = `https://${PROJECT_REF}.supabase.co/storage/v1/object/public/${STORAGE_BUCKET}`;

console.log('📸 Castaway Image Filename Reference\n');
console.log('Expected filenames for Season 50 castaways:\n');
console.log(`📦 Storage Bucket: ${STORAGE_BUCKET}`);
console.log(`🔗 Base URL: ${BASE_URL}\n`);

season50Castaways.forEach((castaway, index) => {
  const url = `${BASE_URL}/${castaway.filename}`;
  console.log(`${(index + 1).toString().padStart(2, ' ')}. ${castaway.name}`);
  console.log(`    File: ${castaway.filename}`);
  console.log(`    URL:  ${url}\n`);
});

console.log(`\nTotal: ${season50Castaways.length} castaways`);
console.log('\n📝 Next steps:');
console.log('   1. Upload these files to Supabase Storage bucket "castaways"');
console.log('   2. Run: npx tsx server/scripts/attach-castaway-images.ts');
console.log('   3. Or use: ./scripts/update-castaway-images.sh');
console.log('\n💡 Tip: For dynamic listing from database, use:');
console.log('   npx tsx server/scripts/list-castaway-images.ts');
