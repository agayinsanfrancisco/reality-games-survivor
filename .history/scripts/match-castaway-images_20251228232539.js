#!/usr/bin/env node

/**
 * Helper script to match uploaded castaway images to their database records
 * 
 * This script helps verify that image filenames match the castaway names
 * in the database. Run this after uploading images to Supabase Storage.
 * 
 * Usage:
 *   node scripts/match-castaway-images.js
 */

const castaways = [
  { name: 'Jenna Lewis-Dougherty', filename: 'jenna-lewis-dougherty.jpg' },
  { name: 'Colby Donaldson', filename: 'colby-donaldson.jpg' },
  { name: 'Stephenie LaGrossa Kendrick', filename: 'stephenie-lagrossa-kendrick.jpg' },
  { name: 'Cirie Fields', filename: 'cirie-fields.jpg' },
  { name: 'Ozzy Lusth', filename: 'ozzy-lusth.jpg' },
  { name: 'Coach Wade', filename: 'coach-wade.jpg' },
  { name: 'Aubry Bracco', filename: 'aubry-bracco.jpg' },
  { name: 'Chrissy Hofbeck', filename: 'chrissy-hofbeck.jpg' },
  { name: 'Christian Hubicki', filename: 'christian-hubicki.jpg' },
  { name: 'Angelina Keeley', filename: 'angelina-keeley.jpg' },
  { name: 'Mike White', filename: 'mike-white.jpg' },
  { name: 'Rick Devens', filename: 'rick-devens.jpg' },
  { name: 'Jonathan Young', filename: 'jonathan-young.jpg' },
  { name: 'Dee Valladares', filename: 'dee-valladares.jpg' },
  { name: 'Emily Flippen', filename: 'emily-flippen.jpg' },
  { name: 'Q Burdette', filename: 'q-burdette.jpg' },
  { name: 'Tiffany Nicole Ervin', filename: 'tiffany-nicole-ervin.jpg' },
  { name: 'Charlie Davis', filename: 'charlie-davis.jpg' },
  { name: 'Genevieve Mushaluk', filename: 'genevieve-mushaluk.jpg' },
  { name: 'Kamilla Karthigesu', filename: 'kamilla-karthigesu.jpg' },
  { name: 'Kyle Fraser', filename: 'kyle-fraser.jpg' },
  { name: 'Joe Hunter', filename: 'joe-hunter.jpg' },
  { name: 'Rizo Velovic', filename: 'rizo-velovic.jpg' },
  { name: 'Savannah Louie', filename: 'savannah-louie.jpg' },
];

console.log('📸 Castaway Image Filename Reference\n');
console.log('Expected filenames for Season 50 castaways:\n');

castaways.forEach((castaway, index) => {
  const url = `https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/${castaway.filename}`;
  console.log(`${(index + 1).toString().padStart(2, ' ')}. ${castaway.name}`);
  console.log(`    File: ${castaway.filename}`);
  console.log(`    URL:  ${url}\n`);
});

console.log(`\nTotal: ${castaways.length} castaways`);
console.log('\n✅ Upload these files to Supabase Storage bucket "castaways"');
console.log('✅ Run migration: npx supabase db push');
