-- ============================================
-- UPDATE CASTAWAY IMAGES FROM ACTUAL STORAGE FILES
-- Migration 015: Match actual filenames from Supabase Storage to castaway names
-- ============================================

-- Base URL for Supabase storage
-- Format: https://{project_ref}.supabase.co/storage/v1/object/public/{bucket}/{path}

-- Match actual filenames from storage to castaway names
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/angelina-keeley.jpg' WHERE name = 'Angelina Keeley';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/aubry-bracco.jpg' WHERE name = 'Aubry Bracco';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/charlie-davis.jpg' WHERE name = 'Charlie Davis';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/chrissy-hofbeck.jpg' WHERE name = 'Chrissy Hofbeck';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/christian-hubicki.jpg' WHERE name = 'Christian Hubicki';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/cirie-fields.jpg' WHERE name = 'Cirie Fields';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/coach-wade.jpg' WHERE name = 'Coach Wade';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/colby-donaldson.jpg' WHERE name = 'Colby Donaldson';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/dee-valladares.jpg' WHERE name = 'Dee Valladares';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/emily-flippen.jpg' WHERE name = 'Emily Flippen';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/genevieve-mushaluk.jpg' WHERE name = 'Genevieve Mushaluk';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/jenna-lewis.jpg' WHERE name = 'Jenna Lewis-Dougherty';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/joe-hunter.jpg' WHERE name = 'Joe Hunter';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/jonathan-young.jpg' WHERE name = 'Jonathan Young';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/kamilla-karthigesu.jpg' WHERE name = 'Kamilla Karthigesu';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/kyle-fraser.jpg' WHERE name = 'Kyle Fraser';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/mike-white.jpg' WHERE name = 'Mike White';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/ozzy-lusth.jpg' WHERE name = 'Ozzy Lusth';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/q-burdette.jpg' WHERE name = 'Q Burdette';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/rick-devens.jpg' WHERE name = 'Rick Devens';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/rizo-velovic.jpg' WHERE name = 'Rizo Velovic';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/savannah-louie.jpg' WHERE name = 'Savannah Louie';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/stephenie-lagrossa.jpg' WHERE name = 'Stephenie LaGrossa Kendrick';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/tiffany-ervin.jpg' WHERE name = 'Tiffany Nicole Ervin';

-- Verify update
SELECT 
  name,
  photo_url,
  CASE 
    WHEN photo_url IS NOT NULL THEN '✅'
    ELSE '❌'
  END as status
FROM castaways 
WHERE photo_url IS NOT NULL 
ORDER BY name;
