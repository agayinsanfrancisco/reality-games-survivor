-- ============================================
-- UPDATE CASTAWAY PHOTOS TO USE SUPABASE STORAGE
-- Migration 012: Replace DiceBear avatars with actual photos
-- ============================================

-- Base URL for Supabase storage
-- Format: https://{project_ref}.supabase.co/storage/v1/object/public/{bucket}/{path}

-- Tuku Tribe (Blue)
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/rob-mariano.jpg' WHERE name = 'Rob Mariano';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/sandra-diaz-twine.jpg' WHERE name = 'Sandra Diaz-Twine';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/tony-vlachos.jpg' WHERE name = 'Tony Vlachos';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/cirie-fields.jpg' WHERE name = 'Cirie Fields';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/tyson-apostol.jpg' WHERE name = 'Tyson Apostol';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/sarah-lacina.jpg' WHERE name = 'Sarah Lacina';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/ben-driebergen.jpg' WHERE name = 'Ben Driebergen';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/natalie-anderson.jpg' WHERE name = 'Natalie Anderson';

-- Gata Tribe (Yellow)
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/parvati-shallow.jpg' WHERE name = 'Parvati Shallow';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/kim-spradlin-wolfe.jpg' WHERE name = 'Kim Spradlin-Wolfe';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/jeremy-collins.jpg' WHERE name = 'Jeremy Collins';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/michele-fitzgerald.jpg' WHERE name = 'Michele Fitzgerald';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/wendell-holland.jpg' WHERE name = 'Wendell Holland';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/sophie-clarke.jpg' WHERE name = 'Sophie Clarke';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/yul-kwon.jpg' WHERE name = 'Yul Kwon';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/denise-stapley.jpg' WHERE name = 'Denise Stapley';

-- Lavo Tribe (Red)
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/ethan-zohn.jpg' WHERE name = 'Ethan Zohn';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/tina-wesson.jpg' WHERE name = 'Tina Wesson';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/earl-cole.jpg' WHERE name = 'Earl Cole';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/jt-thomas.jpg' WHERE name = 'JT Thomas';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/vecepia-towery.jpg' WHERE name = 'Vecepia Towery';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/danni-boatwright.jpg' WHERE name = 'Danni Boatwright';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/adam-klein.jpg' WHERE name = 'Adam Klein';
UPDATE castaways SET photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/nick-wilson.jpg' WHERE name = 'Nick Wilson';

-- Verify update
SELECT name, photo_url FROM castaways ORDER BY name;
