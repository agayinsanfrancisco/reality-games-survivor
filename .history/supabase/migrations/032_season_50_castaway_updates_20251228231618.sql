-- ============================================
-- SEASON 50 CASTAWAY UPDATES
-- Migration 032: Update Season 50 castaways with headshots, trivia, and season history
-- ============================================

-- Ensure trivia columns exist (in case migration 008 wasn't run)
ALTER TABLE castaways ADD COLUMN IF NOT EXISTS previous_seasons TEXT[];
ALTER TABLE castaways ADD COLUMN IF NOT EXISTS best_placement INTEGER;
ALTER TABLE castaways ADD COLUMN IF NOT EXISTS fun_fact TEXT;

-- Add index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_castaways_best_placement ON castaways(best_placement) WHERE best_placement IS NOT NULL;

-- Base URL for Supabase storage
-- Format: https://{project_ref}.supabase.co/storage/v1/object/public/{bucket}/{path}
-- Images should be uploaded to: castaways/{name-slug}.jpg

-- 1. Jenna Lewis-Dougherty
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/jenna-lewis-dougherty.jpg',
  previous_seasons = ARRAY['Borneo (S1)', 'All-Stars (S8)'],
  best_placement = 3,
  fun_fact = 'Only Borneo contestant to make merge in All-Stars; 42-season gap record (breaking Amber/Ethan''s 32); only S50 player never filmed in HD'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Jenna Lewis-Dougherty';

-- 2. Colby Donaldson
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/colby-donaldson.jpg',
  previous_seasons = ARRAY['Australian Outback (S2)', 'All-Stars (S8)', 'Heroes vs. Villains (S20)'],
  best_placement = 2,
  fun_fact = 'Won record 5 consecutive individual immunities in Australian Outback; nicknamed ''Superman in a fat suit'' by Coach',
  tribe_original = 'Vatu'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Colby Donaldson';

-- 3. Stephenie LaGrossa Kendrick
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/stephenie-lagrossa-kendrick.jpg',
  previous_seasons = ARRAY['Palau (S10)', 'Guatemala (S11)', 'Heroes vs. Villains (S20)'],
  best_placement = 2,
  fun_fact = 'Last Ulong member after tribe lost every immunity challenge; first player to vote out all original tribemates',
  tribe_original = 'Vatu'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Stephenie LaGrossa Kendrick';

-- 4. Cirie Fields
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/cirie-fields.jpg',
  previous_seasons = ARRAY['Panama (S12)', 'Micronesia (S16)', 'Heroes vs. Villains (S20)', 'Game Changers (S34)', 'Australia v The World (AU S11)'],
  best_placement = 3,
  fun_fact = 'First player to compete 6 times; eliminated by ''Advantageddon'' with zero votes; never voted out by majority vote; won The Traitors Season 1',
  tribe_original = 'Kalo'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Cirie Fields';

-- 5. Ozzy Lusth
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/ozzy-lusth.jpg',
  previous_seasons = ARRAY['Cook Islands (S13)', 'Micronesia (S16)', 'South Pacific (S23)', 'Game Changers (S34)'],
  best_placement = 2,
  fun_fact = 'Most times voted out (5 times); voted out 3 times in single season (South Pacific); record 128 days played'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Ozzy Lusth';

-- 6. Coach Wade
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/coach-wade.jpg',
  previous_seasons = ARRAY['Tocantins (S18)', 'Heroes vs. Villains (S20)', 'South Pacific (S23)'],
  best_placement = 2,
  fun_fact = '''The Dragon Slayer''; told coworkers he had brain cancer; wrote ''DRAGONSLAYER'' with votes in HvV; symphony conductor',
  tribe_original = 'Kalo'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Coach Wade';

-- 7. Aubry Bracco
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/aubry-bracco.jpg',
  previous_seasons = ARRAY['Kaôh Rōng (S32)', 'Game Changers (S34)', 'Edge of Extinction (S38)'],
  best_placement = 2,
  fun_fact = 'Lost 15 lbs in Game Changers; played on yellow/blue tribes all 3 seasons; tied with Rob M for fastest 4 seasons (18-season span)',
  tribe_original = 'Vatu'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Aubry Bracco';

-- 8. Chrissy Hofbeck
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/chrissy-hofbeck.jpg',
  previous_seasons = ARRAY['Heroes vs. Healers vs. Hustlers (S35)'],
  best_placement = 2,
  fun_fact = 'Won 4 individual immunities; actuarial analyst; oldest woman to win individual immunity at time; received Super Idol Day 1',
  tribe_original = 'Kalo'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Chrissy Hofbeck';

-- 9. Christian Hubicki
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/christian-hubicki.jpg',
  previous_seasons = ARRAY['David vs. Goliath (S37)'],
  best_placement = 7,
  fun_fact = 'Robotics scientist; survived 5-hour endurance challenge; ''Slamtown'' alliance; fan favorite for strategic/social game'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Christian Hubicki';

-- 10. Angelina Keeley
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/angelina-keeley.jpg',
  previous_seasons = ARRAY['David vs. Goliath (S37)'],
  best_placement = 3,
  fun_fact = '''Can I have your jacket?'' moment with Natalie; climbed 100 feet for rice; received 0 jury votes; negotiated rice deal with Jeff',
  tribe_original = 'Vatu'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Angelina Keeley';

-- 11. Mike White
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/mike-white.jpg',
  previous_seasons = ARRAY['David vs. Goliath (S37)'],
  best_placement = 2,
  fun_fact = 'Creator of ''The White Lotus'' (3 Emmy wins); wrote ''School of Rock''; won F4 fire-making; cast S37 players in White Lotus cameos',
  tribe_original = 'Kalo'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Mike White';

-- 12. Rick Devens
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/rick-devens.jpg',
  previous_seasons = ARRAY['Edge of Extinction (S38)'],
  best_placement = 4,
  fun_fact = 'TV news anchor; returned from Edge of Extinction; found multiple idols in final days; lost F4 fire-making to Chris Underwood'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Rick Devens';

-- 13. Jonathan Young
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/jonathan-young.jpg',
  previous_seasons = ARRAY['Season 42 (S42)'],
  best_placement = 6,
  fun_fact = 'Beach training instructor; went viral for physical strength; challenge beast who single-handedly won tribal challenges',
  tribe_original = 'Kalo'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Jonathan Young';

-- 14. Dee Valladares 🏆
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/dee-valladares.jpg',
  previous_seasons = ARRAY['Season 45 (S45)'],
  best_placement = 1,
  fun_fact = 'First Latina Sole Survivor in new era; dominant strategic game; showmance with Austin; received 5 of 8 jury votes',
  tribe_original = 'Kalo'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Dee Valladares';

-- 15. Emily Flippen
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/emily-flippen.jpg',
  previous_seasons = ARRAY['Season 45 (S45)'],
  best_placement = 4,
  fun_fact = 'Investment analyst; redemption arc from social outcast to fan favorite; started game poorly but became beloved'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Emily Flippen';

-- 16. Q Burdette
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/q-burdette.jpg',
  previous_seasons = ARRAY['Season 46 (S46)'],
  best_placement = 5,
  fun_fact = 'Former college football player; attempted to get voted out then changed mind; unpredictable gameplay; chaotic strategist',
  tribe_original = 'Vatu'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Q Burdette';

-- 17. Tiffany Nicole Ervin
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/tiffany-nicole-ervin.jpg',
  previous_seasons = ARRAY['Season 46 (S46)'],
  best_placement = 3,
  fun_fact = 'Artist and content creator; strong social connections; worked closely with Q despite frustrations',
  tribe_original = 'Kalo'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Tiffany Nicole Ervin';

-- 18. Charlie Davis
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/charlie-davis.jpg',
  previous_seasons = ARRAY['Season 46 (S46)'],
  best_placement = 2,
  fun_fact = 'Harvard Law graduate; tight alliance with winner Kenzie; strong strategic game; Taylor Swift fan (cruel summer reference from Jeff)',
  tribe_original = 'Kalo'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Charlie Davis';

-- 19. Genevieve Mushaluk
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/genevieve-mushaluk.jpg',
  previous_seasons = ARRAY['Season 47 (S47)'],
  best_placement = 3,
  fun_fact = 'Corporate lawyer from Canada; strategic force in S47; started emotionless, learned emotion was key to her game',
  tribe_original = 'Vatu'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Genevieve Mushaluk';

-- 20. Kamilla Karthigesu
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/kamilla-karthigesu.jpg',
  previous_seasons = ARRAY['Season 48 (S48)'],
  best_placement = 3,
  fun_fact = 'Tech professional; came in with self-doubt, emerged as an ''assassin''; strategic gameplay with strong social bonds',
  tribe_original = 'Kalo'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Kamilla Karthigesu';

-- 21. Kyle Fraser 🏆
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/kyle-fraser.jpg',
  previous_seasons = ARRAY['Season 48 (S48)'],
  best_placement = 1,
  fun_fact = 'Most recent winner before S50 filming; cunning, athletic, and charming; won in May 2025',
  tribe_original = 'Vatu'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Kyle Fraser';

-- 22. Joe Hunter
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/joe-hunter.jpg',
  previous_seasons = ARRAY['Season 48 (S48)'],
  best_placement = 4,
  fun_fact = 'Fire captain; played one of most emotional and loyal games ever while dominating challenges physically'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Joe Hunter';

-- 23. Rizo Velovic
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/rizo-velovic.jpg',
  previous_seasons = ARRAY['Season 49 (S49)'],
  best_placement = 4,
  fun_fact = 'Lost fire-making to Savannah; identity kept secret until S49 aired (S50 announced first); nicknamed ''Rizgod''',
  tribe_original = 'Vatu'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Rizo Velovic';

-- 24. Savannah Louie 🏆
UPDATE castaways SET
  photo_url = 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/savannah-louie.jpg',
  previous_seasons = ARRAY['Season 49 (S49)'],
  best_placement = 1,
  fun_fact = 'Most recent Sole Survivor; identity kept secret until S49 aired; defeated Rizo in fire-making; strong strategic game'
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND name = 'Savannah Louie';

-- Verify updates
SELECT 
  name,
  photo_url,
  previous_seasons,
  best_placement,
  fun_fact
FROM castaways 
WHERE season_id IN (SELECT id FROM seasons WHERE number = 50)
ORDER BY name;
