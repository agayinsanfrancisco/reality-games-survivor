-- ============================================
-- REPLACE SEASON 50 CASTAWAYS
-- Migration 016: Replace all Season 50 castaways with correct cast
-- ============================================

-- Get Season 50 ID for safety
DO $$
DECLARE
  season_50_id UUID;
BEGIN
  SELECT id INTO season_50_id FROM seasons WHERE number = 50;
  
  IF season_50_id IS NULL THEN
    RAISE EXCEPTION 'Season 50 not found';
  END IF;

  -- Delete all existing Season 50 castaways
  DELETE FROM castaways WHERE season_id = season_50_id;

  -- Insert new Season 50 castaways
  -- VATU TRIBE (Purple) - 8 castaways
  INSERT INTO castaways (season_id, name, age, hometown, occupation, status, previous_seasons, best_placement, fun_fact, tribe_original, photo_url) VALUES
  (season_50_id, 'Colby Donaldson', 51, 'Los Angeles, CA', 'TV Personality', 'active',
    ARRAY['Australian Outback (S2)', 'All-Stars (S8)', 'Heroes vs Villains (S20)'],
    2, 'Won record 5 consecutive individual immunities in Australian Outback; nicknamed ''Superman in a fat suit'' by Coach',
    'Vatu', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/colby-donaldson.jpg'),

  (season_50_id, 'Stephenie LaGrossa Kendrick', 45, 'Philadelphia, PA', 'TV Personality', 'active',
    ARRAY['Palau (S10)', 'Guatemala (S11)', 'Heroes vs Villains (S20)'],
    2, 'Last Ulong member after tribe lost every immunity challenge; first player to vote out all original tribemates',
    'Vatu', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/stephenie-lagrossa.jpg'),

  (season_50_id, 'Aubry Bracco', 39, 'Los Angeles, CA', 'TV Personality', 'active',
    ARRAY['Kaôh Rōng (S32)', 'Game Changers (S34)', 'Edge of Extinction (S38)'],
    2, 'Lost 15 lbs in Game Changers; played on yellow/blue tribes all 3 seasons; tied with Rob M for fastest 4 seasons (18-season span)',
    'Vatu', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/aubry-bracco.jpg'),

  (season_50_id, 'Angelina Keeley', 35, 'San Clemente, CA', 'TV Personality', 'active',
    ARRAY['David vs Goliath (S37)'],
    3, '''Can I have your jacket?'' moment with Natalie; climbed 100 feet for rice; received 0 jury votes; negotiated rice deal with Jeff',
    'Vatu', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/angelina-keeley.jpg'),

  (season_50_id, 'Q Burdette', 31, 'Memphis, TN', 'Former College Football Player', 'active',
    ARRAY['Season 46'],
    5, 'Former college football player; attempted to get voted out then changed mind; unpredictable gameplay; chaotic strategist',
    'Vatu', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/q-burdette.jpg'),

  (season_50_id, 'Genevieve Mushaluk', 34, 'Winnipeg, MB', 'Corporate Lawyer', 'active',
    ARRAY['Season 47'],
    3, 'Corporate lawyer from Canada; strategic force in S47; started emotionless, learned emotion was key to her game',
    'Vatu', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/genevieve-mushaluk.jpg'),

  (season_50_id, 'Kyle Fraser', 32, 'Brooklyn, NY', 'Attorney', 'active',
    ARRAY['Season 48'],
    1, 'Attorney; won with ''people first'' strategy via secret alliance with Kamilla; first male winner since S39 to win Final Immunity',
    'Vatu', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/kyle-fraser.jpg'),

  (season_50_id, 'Rizo Velovic', 25, 'Yonkers, NY', 'TV Personality', 'active',
    ARRAY['Season 49'],
    4, 'Lost fire-making to Savannah; held idol for record 9 Tribal Councils; identity kept secret until S49 aired; nicknamed ''Rizgod''',
    'Vatu', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/rizo-velovic.jpg');

  -- KALO TRIBE (Teal) - 8 castaways
  INSERT INTO castaways (season_id, name, age, hometown, occupation, status, previous_seasons, best_placement, fun_fact, tribe_original, photo_url) VALUES
  (season_50_id, 'Coach Wade', 53, 'Susanville, CA', 'Symphony Conductor', 'active',
    ARRAY['Tocantins (S18)', 'Heroes vs Villains (S20)', 'South Pacific (S23)'],
    2, '''The Dragon Slayer''; symphony conductor; wrote ''DRAGONSLAYER'' with votes in HvV',
    'Kalo', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/coach-wade.jpg'),

  (season_50_id, 'Chrissy Hofbeck', 54, 'Lebanon Township, NJ', 'Actuarial Analyst', 'active',
    ARRAY['Heroes vs Healers vs Hustlers (S35)'],
    2, 'Won 4 individual immunities; actuarial analyst; oldest woman to win individual immunity at time; received Super Idol Day 1',
    'Kalo', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/chrissy-hofbeck.jpg'),

  (season_50_id, 'Mike White', 54, 'Los Angeles, CA', 'TV Writer/Producer', 'active',
    ARRAY['David vs Goliath (S37)'],
    2, 'Creator of ''The White Lotus'' (3 Emmy wins); wrote ''School of Rock''; won F4 fire-making; cast S37 players in White Lotus cameos',
    'Kalo', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/mike-white.jpg'),

  (season_50_id, 'Jonathan Young', 32, 'Gulf Shores, AL', 'Beach Training Instructor', 'active',
    ARRAY['Season 42'],
    6, 'Beach training instructor; went viral for physical strength; challenge beast who single-handedly won tribal challenges',
    'Kalo', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/jonathan-young.jpg'),

  (season_50_id, 'Dee Valladares', 28, 'Miami, FL', 'TV Personality', 'active',
    ARRAY['Season 45'],
    1, 'First Latina Sole Survivor in new era; dominant strategic game; showmance with Austin; received 5 of 8 jury votes',
    'Kalo', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/dee-valladares.jpg'),

  (season_50_id, 'Tiffany Nicole Ervin', 34, 'Elizabeth, NJ', 'Artist and Content Creator', 'active',
    ARRAY['Season 46'],
    3, 'Artist and content creator; strong social connections; worked closely with Q despite frustrations',
    'Kalo', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/tiffany-ervin.jpg'),

  (season_50_id, 'Charlie Davis', 27, 'Boston, MA', 'Harvard Law Graduate', 'active',
    ARRAY['Season 46'],
    2, 'Harvard Law graduate; tight alliance with winner Kenzie; strong strategic game; Taylor Swift fan (cruel summer reference from Jeff)',
    'Kalo', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/charlie-davis.jpg'),

  (season_50_id, 'Kamilla Karthigesu', 31, 'Foster City, CA', 'Tech Professional', 'active',
    ARRAY['Season 48'],
    3, 'Tech professional; came in with self-doubt, emerged as an ''assassin''; strategic gameplay with strong social bonds',
    'Kalo', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/kamilla-karthigesu.jpg');

  -- CILA TRIBE (Orange) - 8 castaways (TBD = Cila)
  INSERT INTO castaways (season_id, name, age, hometown, occupation, status, previous_seasons, best_placement, fun_fact, tribe_original, photo_url) VALUES
  (season_50_id, 'Jenna Lewis-Dougherty', 47, 'Burbank, CA', 'TV Personality', 'active',
    ARRAY['Borneo (S1)', 'All-Stars (S8)'],
    3, 'Only Borneo contestant to make merge in All-Stars; 42-season gap record (breaking Amber/Ethan''s 32); only S50 player never filmed in HD',
    'Cila', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/jenna-lewis.jpg'),

  (season_50_id, 'Cirie Fields', 54, 'Norwalk, CT', 'Nurse', 'active',
    ARRAY['Panama (S12)', 'Micronesia (S16)', 'Heroes vs Villains (S20)', 'Game Changers (S34)', 'AU Season 11: Australia v The World'],
    3, 'First player to compete 6 times; eliminated by ''Advantageddon'' with zero votes; never voted out by majority vote; won The Traitors Season 1',
    'Cila', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/cirie-fields.jpg'),

  (season_50_id, 'Ozzy Lusth', 43, 'Venice, CA', 'TV Personality', 'active',
    ARRAY['Cook Islands (S13)', 'Micronesia (S16)', 'South Pacific (S23)', 'Game Changers (S34)'],
    2, 'Most times voted out (5 times); voted out 3 times in single season (South Pacific); record 128 days played',
    'Cila', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/ozzy-lusth.jpg'),

  (season_50_id, 'Christian Hubicki', 39, 'Tallahassee, FL', 'Robotics Scientist', 'active',
    ARRAY['David vs Goliath (S37)'],
    7, 'Robotics scientist; survived 5-hour endurance challenge; ''Slamtown'' alliance; fan favorite for strategic/social game',
    'Cila', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/christian-hubicki.jpg'),

  (season_50_id, 'Rick Devens', 41, 'Macon, GA', 'TV News Anchor', 'active',
    ARRAY['Edge of Extinction (S38)'],
    4, 'TV news anchor; returned from Edge of Extinction; found multiple idols in final days; lost F4 fire-making to Chris Underwood',
    'Cila', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/rick-devens.jpg'),

  (season_50_id, 'Emily Flippen', 30, 'Laurel, MD', 'Investment Analyst', 'active',
    ARRAY['Season 45'],
    4, 'Investment analyst; redemption arc from social outcast to fan favorite; started game poorly but became beloved',
    'Cila', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/emily-flippen.jpg'),

  (season_50_id, 'Joe Hunter', 45, 'West Sacramento, CA', 'Fire Captain', 'active',
    ARRAY['Season 48'],
    4, 'Fire captain; played one of most emotional and loyal games ever while dominating challenges physically',
    'Cila', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/joe-hunter.jpg'),

  (season_50_id, 'Savannah Louie', 31, 'Atlanta, GA', 'Former Reporter', 'active',
    ARRAY['Season 49'],
    1, 'Won 5-2-1; tied record for most female immunity wins (4); defeated Rizo in fire-making; former reporter turned Sole Survivor',
    'Cila', 'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/savannah-louie.jpg');

END $$;

-- Verify update - Count by tribe
SELECT tribe_original, COUNT(*) as count 
FROM castaways 
WHERE season_id = (SELECT id FROM seasons WHERE number = 50)
  AND tribe_original IS NOT NULL 
GROUP BY tribe_original 
ORDER BY tribe_original;

-- Verify update - Show all castaways with their tribes
SELECT 
  name,
  tribe_original,
  status,
  photo_url
FROM castaways 
WHERE season_id = (SELECT id FROM seasons WHERE number = 50)
ORDER BY tribe_original, name;
