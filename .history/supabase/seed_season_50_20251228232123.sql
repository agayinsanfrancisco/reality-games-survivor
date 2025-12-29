-- ============================================
-- SEASON 50 SEED DATA
-- Reality Games Fantasy League - Survivor
-- ============================================

-- Clear existing Season 50 data (if any)
DELETE FROM episode_scores WHERE episode_id IN (SELECT id FROM episodes WHERE season_id IN (SELECT id FROM seasons WHERE number = 50));
DELETE FROM weekly_picks WHERE episode_id IN (SELECT id FROM episodes WHERE season_id IN (SELECT id FROM seasons WHERE number = 50));
DELETE FROM rosters WHERE castaway_id IN (SELECT id FROM castaways WHERE season_id IN (SELECT id FROM seasons WHERE number = 50));
DELETE FROM episodes WHERE season_id IN (SELECT id FROM seasons WHERE number = 50);
DELETE FROM castaways WHERE season_id IN (SELECT id FROM seasons WHERE number = 50);
DELETE FROM scoring_rules WHERE season_id IN (SELECT id FROM seasons WHERE number = 50);
DELETE FROM leagues WHERE season_id IN (SELECT id FROM seasons WHERE number = 50) AND is_global = false;
DELETE FROM seasons WHERE number = 50;

-- ============================================
-- CREATE SEASON 50
-- ============================================
INSERT INTO seasons (id, number, name, is_active, registration_opens_at, draft_order_deadline, registration_closes_at, premiere_at, draft_deadline, finale_at)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  50,
  'Survivor 50: In the Hands of the Fans',
  true,
  '2025-12-19 12:00:00-08',  -- Dec 19, 2025 12:00 PM PST
  '2026-01-05 12:00:00-08',  -- Jan 5, 2026 12:00 PM PST
  '2026-02-25 17:00:00-08',  -- Feb 25, 2026 5:00 PM PST
  '2026-02-25 20:00:00-08',  -- Feb 25, 2026 8:00 PM PST
  '2026-03-02 20:00:00-08',  -- Mar 2, 2026 8:00 PM PST
  '2026-05-27 20:00:00-07'   -- May 27, 2026 8:00 PM PDT
);

-- ============================================
-- CASTAWAYS (24 legendary players)
-- ============================================
INSERT INTO castaways (season_id, name, age, hometown, occupation, status, previous_seasons, best_placement, fun_fact, photo_url, tribe_original) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Jenna Lewis-Dougherty', 47, 'Burbank, CA', NULL, 'active',
  ARRAY['Borneo (S1)', 'All-Stars (S8)'],
  3, 'Only Borneo contestant to make merge in All-Stars; 42-season gap record (breaking Amber/Ethan''s 32); only S50 player never filmed in HD',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/jenna-lewis-dougherty.jpg', NULL),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Colby Donaldson', 51, 'Los Angeles, CA', NULL, 'active',
  ARRAY['Australian Outback (S2)', 'All-Stars (S8)', 'Heroes vs. Villains (S20)'],
  2, 'Won record 5 consecutive individual immunities in Australian Outback; nicknamed ''Superman in a fat suit'' by Coach',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/colby-donaldson.jpg', 'Vatu'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Stephenie LaGrossa Kendrick', 45, 'Philadelphia, PA', NULL, 'active',
  ARRAY['Palau (S10)', 'Guatemala (S11)', 'Heroes vs. Villains (S20)'],
  2, 'Last Ulong member after tribe lost every immunity challenge; first player to vote out all original tribemates',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/stephenie-lagrossa-kendrick.jpg', 'Vatu'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cirie Fields', 54, 'Norwalk, CT', NULL, 'active',
  ARRAY['Panama (S12)', 'Micronesia (S16)', 'Heroes vs. Villains (S20)', 'Game Changers (S34)', 'Australia v The World (AU S11)'],
  3, 'First player to compete 6 times; eliminated by ''Advantageddon'' with zero votes; never voted out by majority vote; won The Traitors Season 1',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/cirie-fields.jpg', 'Kalo'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ozzy Lusth', 43, 'Venice, CA', NULL, 'active',
  ARRAY['Cook Islands (S13)', 'Micronesia (S16)', 'South Pacific (S23)', 'Game Changers (S34)'],
  2, 'Most times voted out (5 times); voted out 3 times in single season (South Pacific); record 128 days played',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/ozzy-lusth.jpg', NULL),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Coach Wade', 53, 'Susanville, CA', NULL, 'active',
  ARRAY['Tocantins (S18)', 'Heroes vs. Villains (S20)', 'South Pacific (S23)'],
  2, '''The Dragon Slayer''; told coworkers he had brain cancer; wrote ''DRAGONSLAYER'' with votes in HvV; symphony conductor',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/coach-wade.jpg', 'Kalo'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Aubry Bracco', 39, 'Los Angeles, CA', NULL, 'active',
  ARRAY['Kaôh Rōng (S32)', 'Game Changers (S34)', 'Edge of Extinction (S38)'],
  2, 'Lost 15 lbs in Game Changers; played on yellow/blue tribes all 3 seasons; tied with Rob M for fastest 4 seasons (18-season span)',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/aubry-bracco.jpg', 'Vatu'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Chrissy Hofbeck', 54, 'Lebanon Township, NJ', NULL, 'active',
  ARRAY['Heroes vs. Healers vs. Hustlers (S35)'],
  2, 'Won 4 individual immunities; actuarial analyst; oldest woman to win individual immunity at time; received Super Idol Day 1',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/chrissy-hofbeck.jpg', 'Kalo'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Christian Hubicki', 39, 'Tallahassee, FL', NULL, 'active',
  ARRAY['David vs. Goliath (S37)'],
  7, 'Robotics scientist; survived 5-hour endurance challenge; ''Slamtown'' alliance; fan favorite for strategic/social game',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/christian-hubicki.jpg', NULL),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Angelina Keeley', 35, 'San Clemente, CA', NULL, 'active',
  ARRAY['David vs. Goliath (S37)'],
  3, '''Can I have your jacket?'' moment with Natalie; climbed 100 feet for rice; received 0 jury votes; negotiated rice deal with Jeff',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/angelina-keeley.jpg', 'Vatu'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mike White', 54, 'Los Angeles, CA', NULL, 'active',
  ARRAY['David vs. Goliath (S37)'],
  2, 'Creator of ''The White Lotus'' (3 Emmy wins); wrote ''School of Rock''; won F4 fire-making; cast S37 players in White Lotus cameos',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/mike-white.jpg', 'Kalo'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Rick Devens', 41, 'Macon, GA', NULL, 'active',
  ARRAY['Edge of Extinction (S38)'],
  4, 'TV news anchor; returned from Edge of Extinction; found multiple idols in final days; lost F4 fire-making to Chris Underwood',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/rick-devens.jpg', NULL),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Jonathan Young', 32, 'Gulf Shores, AL', NULL, 'active',
  ARRAY['Season 42 (S42)'],
  6, 'Beach training instructor; went viral for physical strength; challenge beast who single-handedly won tribal challenges',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/jonathan-young.jpg', 'Kalo'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Dee Valladares', 28, 'Miami, FL', NULL, 'active',
  ARRAY['Season 45 (S45)'],
  1, 'First Latina Sole Survivor in new era; dominant strategic game; showmance with Austin; received 5 of 8 jury votes',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/dee-valladares.jpg', 'Kalo'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Emily Flippen', 30, 'Laurel, MD', NULL, 'active',
  ARRAY['Season 45 (S45)'],
  4, 'Investment analyst; redemption arc from social outcast to fan favorite; started game poorly but became beloved',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/emily-flippen.jpg', NULL),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Q Burdette', 31, 'Memphis, TN', NULL, 'active',
  ARRAY['Season 46 (S46)'],
  5, 'Former college football player; attempted to get voted out then changed mind; unpredictable gameplay; chaotic strategist',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/q-burdette.jpg', 'Vatu'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Tiffany Nicole Ervin', 34, 'Elizabeth, NJ', NULL, 'active',
  ARRAY['Season 46 (S46)'],
  3, 'Artist and content creator; strong social connections; worked closely with Q despite frustrations',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/tiffany-nicole-ervin.jpg', 'Kalo'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Charlie Davis', 27, 'Boston, MA', NULL, 'active',
  ARRAY['Season 46 (S46)'],
  2, 'Harvard Law graduate; tight alliance with winner Kenzie; strong strategic game; Taylor Swift fan (cruel summer reference from Jeff)',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/charlie-davis.jpg', 'Kalo'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Genevieve Mushaluk', 34, 'Winnipeg, MB', NULL, 'active',
  ARRAY['Season 47 (S47)'],
  3, 'Corporate lawyer from Canada; strategic force in S47; started emotionless, learned emotion was key to her game',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/genevieve-mushaluk.jpg', 'Vatu'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Kamilla Karthigesu', 31, 'Foster City, CA', NULL, 'active',
  ARRAY['Season 48 (S48)'],
  3, 'Tech professional; came in with self-doubt, emerged as an ''assassin''; strategic gameplay with strong social bonds',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/kamilla-karthigesu.jpg', 'Kalo'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Kyle Fraser', 31, 'Brooklyn, NY', NULL, 'active',
  ARRAY['Season 48 (S48)'],
  1, 'Most recent winner before S50 filming; cunning, athletic, and charming; won in May 2025',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/kyle-fraser.jpg', 'Vatu'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Joe Hunter', 45, 'West Sacramento, CA', NULL, 'active',
  ARRAY['Season 48 (S48)'],
  4, 'Fire captain; played one of most emotional and loyal games ever while dominating challenges physically',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/joe-hunter.jpg', NULL),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Rizo Velovic', 25, 'Yonkers, NY', NULL, 'active',
  ARRAY['Season 49 (S49)'],
  4, 'Lost fire-making to Savannah; identity kept secret until S49 aired (S50 announced first); nicknamed ''Rizgod''',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/rizo-velovic.jpg', 'Vatu'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Savannah Louie', 31, 'Atlanta, GA', NULL, 'active',
  ARRAY['Season 49 (S49)'],
  1, 'Most recent Sole Survivor; identity kept secret until S49 aired; defeated Rizo in fire-making; strong strategic game',
  'https://qxrgejdfxcvsfktgysop.supabase.co/storage/v1/object/public/castaways/savannah-louie.jpg', NULL);

-- ============================================
-- EPISODES (14 episodes for Season 50)
-- ============================================
INSERT INTO episodes (season_id, number, title, air_date, picks_lock_at, results_posted_at, is_finale) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, 'The Greatest Showdown Begins', '2026-02-25 20:00:00-08', '2026-02-25 15:00:00-08', '2026-02-27 12:00:00-08', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2, 'Legends Collide', '2026-03-04 20:00:00-08', '2026-03-04 15:00:00-08', '2026-03-06 12:00:00-08', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 3, 'Trust No One', '2026-03-11 20:00:00-08', '2026-03-11 15:00:00-08', '2026-03-13 12:00:00-08', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 4, 'Shifting Alliances', '2026-03-18 20:00:00-07', '2026-03-18 15:00:00-07', '2026-03-20 12:00:00-07', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 5, 'Swap Chaos', '2026-03-25 20:00:00-07', '2026-03-25 15:00:00-07', '2026-03-27 12:00:00-07', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 6, 'Merge Madness', '2026-04-01 20:00:00-07', '2026-04-01 15:00:00-07', '2026-04-03 12:00:00-07', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 7, 'Individual Immunity', '2026-04-08 20:00:00-07', '2026-04-08 15:00:00-07', '2026-04-10 12:00:00-07', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 8, 'Idol Frenzy', '2026-04-15 20:00:00-07', '2026-04-15 15:00:00-07', '2026-04-17 12:00:00-07', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 9, 'Blindside Boulevard', '2026-04-22 20:00:00-07', '2026-04-22 15:00:00-07', '2026-04-24 12:00:00-07', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 10, 'The Auction Returns', '2026-04-29 20:00:00-07', '2026-04-29 15:00:00-07', '2026-05-01 12:00:00-07', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 11, 'Endgame Begins', '2026-05-06 20:00:00-07', '2026-05-06 15:00:00-07', '2026-05-08 12:00:00-07', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 12, 'Family Visit', '2026-05-13 20:00:00-07', '2026-05-13 15:00:00-07', '2026-05-15 12:00:00-07', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 13, 'Final Four Frenzy', '2026-05-20 20:00:00-07', '2026-05-20 15:00:00-07', '2026-05-22 12:00:00-07', false),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 14, 'Reunion & Finale', '2026-05-27 20:00:00-07', '2026-05-27 15:00:00-07', '2026-05-29 12:00:00-07', true);

-- ============================================
-- SCORING RULES (Official RGFL Rules)
-- ============================================
INSERT INTO scoring_rules (season_id, code, name, description, points, category, is_negative, sort_order, is_active) VALUES

-- ============================================
-- PRE-MERGE TEAM REWARD AND IMMUNITY CHALLENGES
-- ============================================
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PRE_TEAM_REWARD_WIN', 'Team Wins Reward (Pre-Merge)', 'Your player''s team wins a reward challenge (if three teams, get 1st or 2nd)', 1, 'Pre-Merge Challenges', false, 1, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PRE_TEAM_IMMUNITY_WIN', 'Team Wins Immunity (Pre-Merge)', 'Your player''s team wins an immunity challenge (if three teams, get 1st or 2nd)', 1, 'Pre-Merge Challenges', false, 2, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PRE_TEAM_COMBINED_WIN', 'Team Wins Combined Challenge (Pre-Merge)', 'Your player''s team wins a combined reward/immunity challenge (do not get double points)', 1, 'Pre-Merge Challenges', false, 3, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PRE_TEAM_LAST_PLACE', 'Team Gets Last Place (Pre-Merge)', 'Your player''s team gets last place in an immunity, reward, or combined challenge', -1, 'Pre-Merge Challenges', true, 4, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PRE_SIT_OUT', 'Sit Out Challenge (Pre-Merge)', 'Your player sits out of a reward, immunity or combined challenge', -1, 'Pre-Merge Challenges', true, 5, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PRE_GIVE_UP_REWARD', 'Give Up Reward Chance (Pre-Merge)', 'Your player gives up their chance for reward to someone else before the challenge; not penalized for sitting out', 1, 'Pre-Merge Challenges', false, 6, true),

-- ============================================
-- PRE-MERGE TRIBAL COUNCIL
-- ============================================
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PRE_NO_TRIBAL', 'Avoid Tribal Council (Pre-Merge)', 'Your player doesn''t go to tribal council', 5, 'Pre-Merge Tribal', false, 10, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PRE_ATTEND_TRIBAL', 'Attend Tribal Council (Pre-Merge)', 'Your player goes to tribal council', -2, 'Pre-Merge Tribal', true, 11, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PRE_CANNOT_VOTE', 'Cannot Vote at Tribal (Pre-Merge)', 'Your player goes to tribal council but cannot vote (lost vote or stolen; no penalty for Shot in the Dark)', -1, 'Pre-Merge Tribal', true, 12, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PRE_SWING_VOTE', 'Swing Vote (Pre-Merge)', 'Your player is the swing vote of the episode (clearly stated in confessional; individual, not a team)', 2, 'Pre-Merge Tribal', false, 13, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PRE_SURVIVE_TRIBAL', 'Survive Tribal (Pre-Merge)', 'Your player goes to tribal council but does not get snuffed', 5, 'Pre-Merge Tribal', false, 14, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PRE_VOTE_RECEIVED_COUNT', 'Vote Received Counts (Pre-Merge)', 'Each vote your player receives to vote them out that counts', -1, 'Pre-Merge Tribal', true, 15, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PRE_VOTE_RECEIVED_NO_COUNT', 'Vote Received Doesn''t Count (Pre-Merge)', 'Each vote your player receives but does not count (eg player is now immune after votes cast)', 1, 'Pre-Merge Tribal', false, 16, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PRE_SNUFFED', 'Torch Snuffed (Pre-Merge)', 'Your player is snuffed at tribal council', -5, 'Pre-Merge Tribal', true, 17, true),

-- ============================================
-- POST-MERGE REWARD AND INDIVIDUAL IMMUNITY CHALLENGES
-- ============================================
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_IND_REWARD_WIN', 'Win Individual Reward', 'Your player wins an individual reward challenge', 3, 'Post-Merge Challenges', false, 20, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_TEAM_REWARD_WIN', 'Win Team Reward (Post-Merge)', 'Your player participates in a team reward challenge and wins', 1, 'Post-Merge Challenges', false, 21, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_MULTI_ROUND_ADVANCE', 'Advance in Multi-Round Challenge', 'Each round your player advances in a multi-round immunity or reward challenge', 1, 'Post-Merge Challenges', false, 22, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_CHOSEN_FOR_REWARD', 'Chosen for Reward', 'Your player gets chosen to go on a reward or has a reward given to them', 1, 'Post-Merge Challenges', false, 23, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_GIVE_REWARD', 'Give Reward to Someone', 'Your player gives their reward to someone else', 2, 'Post-Merge Challenges', false, 24, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_GIVE_UP_REWARD', 'Give Up Reward Chance (Post-Merge)', 'Your player gives up their chance for reward to someone else before the challenge; not penalized for sitting out', 1, 'Post-Merge Challenges', false, 25, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_AUCTION_MOST_MONEY', 'Most Money at Auction', 'Your player has the most money going into the Survivor auction', 1, 'Post-Merge Challenges', false, 26, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_AUCTION_LEAST_MONEY', 'Least Money at Auction', 'Your player has the least money going into the Survivor auction', -1, 'Post-Merge Challenges', true, 27, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_AUCTION_SHARE_FOOD', 'Share Food at Auction', 'Your player shares food, voluntarily or forced by rules, with others at auction', 1, 'Post-Merge Challenges', false, 28, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_AUCTION_UNSAVORY', 'Unsavory Auction Item', 'Your player spends money on an unsavory item (by Western standards) at auction', -1, 'Post-Merge Challenges', true, 29, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_IND_IMMUNITY_WIN', 'Win Individual Immunity', 'Your player wins individual immunity (includes Final Four fire-making challenge)', 7, 'Post-Merge Challenges', false, 30, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_COMBINED_WIN', 'Win Combined Reward/Immunity', 'Your player wins a combined reward/individual immunity challenge (do not get more points since one challenge)', 7, 'Post-Merge Challenges', false, 31, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_FIRST_ELIMINATED', 'First Eliminated in Challenge', 'Your player is the first individual eliminated in an individual reward or immunity challenge', -1, 'Post-Merge Challenges', true, 32, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_FIRST_ROUND_ELIM', 'Eliminated First Round Multi-Round', 'Your player is eliminated in the first round of a multi-round individual reward or immunity challenge', -1, 'Post-Merge Challenges', true, 33, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_SIT_OUT', 'Sit Out Challenge (Post-Merge)', 'Your player sits out of a reward or immunity challenge', -1, 'Post-Merge Challenges', true, 34, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_QUIT_FOR_FOOD', 'Quit Challenge for Food', 'Your player quits an individual immunity challenge in exchange for an immediate reward (like food)', -2, 'Post-Merge Challenges', true, 35, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_CONVINCE_QUIT', 'Convince Someone to Quit Challenge', 'Your player convinces another player to quit an individual reward or immunity challenge', 3, 'Post-Merge Challenges', false, 36, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_CHOOSE_SELF_FIRE', 'Choose Self for Fire-Making', 'Your player chooses oneself for the Final Four fire-making challenge', 4, 'Post-Merge Challenges', false, 37, true),

-- ============================================
-- POST-MERGE AND MERGE-ATORY TRIBAL COUNCIL
-- ============================================
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_NO_TRIBAL', 'Avoid Tribal Council (Post-Merge)', 'Your player does not go to tribal council', 5, 'Post-Merge Tribal', false, 40, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_SURVIVE_TRIBAL', 'Survive Tribal (Post-Merge)', 'Your player goes to tribal council but doesn''t get snuffed', 5, 'Post-Merge Tribal', false, 41, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_CANNOT_VOTE', 'Cannot Vote at Tribal (Post-Merge)', 'Your player goes to tribal council but cannot vote (lost vote or stolen; no penalty for Shot in the Dark)', -1, 'Post-Merge Tribal', true, 42, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_SWING_VOTE', 'Swing Vote (Post-Merge)', 'Your player is the swing vote of the episode (clearly stated in confessional; individual, not a team)', 2, 'Post-Merge Tribal', false, 43, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_VOTE_RECEIVED_COUNT', 'Vote Received Counts (Post-Merge)', 'Each vote your player receives to vote them out that counts', -1, 'Post-Merge Tribal', true, 44, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_VOTE_RECEIVED_NO_COUNT', 'Vote Received Doesn''t Count (Post-Merge)', 'Each vote your player receives but does not count (eg player is now immune after votes cast)', 1, 'Post-Merge Tribal', false, 45, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'POST_SNUFFED', 'Torch Snuffed (Post-Merge)', 'Your player is snuffed at tribal council', -5, 'Post-Merge Tribal', true, 46, true),

-- ============================================
-- ADVANTAGES SCORING
-- ============================================
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_JOURNEY', 'Go on Journey', 'Your player goes on a journey', 1, 'Advantages', false, 50, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_JOURNEY_RISK_WIN', 'Journey Risk Wins Advantage', 'Your player is on a journey, does not play it safe (if choice), and wins the advantage', 3, 'Advantages', false, 51, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_JOURNEY_FORCED_WIN', 'Journey Forced Play Wins', 'Your player is on a journey, must play (no choice), and wins the advantage', 2, 'Advantages', false, 52, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_JOURNEY_RISK_DISADVANTAGE', 'Journey Risk Gets Disadvantage', 'Your player is on a journey, does not play it safe (if choice), and incurs a disadvantage', 1, 'Advantages', false, 53, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_JOURNEY_FORCED_DISADVANTAGE', 'Journey Forced Gets Disadvantage', 'Your player is on a journey, must play (no choice), and incurs a disadvantage', -1, 'Advantages', true, 54, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_JOURNEY_SAFE', 'Journey Plays Safe', 'Your player is on a journey, plays it safe (if choice), and does not get advantage or disadvantage', -1, 'Advantages', true, 55, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_MISS_PLAIN_SIGHT', 'Miss Advantage in Plain Sight', 'Your player does not locate a hidden immunity idol or advantage in plain sight', -1, 'Advantages', true, 56, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_FIND_OUTSIDE_JOURNEY', 'Find Advantage Outside Journey', 'Your player obtains an advantage or clue outside of a journey (+3 only when viewers learn of it)', 3, 'Advantages', false, 57, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_ACTIVATE', 'Activate Advantage', 'Your player activates an advantage by completing prerequisites (eg Beware advantage)', 1, 'Advantages', false, 58, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_ACTIVATE_FAIL', 'Fail to Activate Advantage', 'Your player attempts to activate a real advantage but fails', -1, 'Advantages', true, 59, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_NOT_FOUND_END_EP', 'Clue Not Found by Episode End', 'Your player has a clue to advantage not found by episode end, or inactive advantage not activated', -1, 'Advantages', true, 60, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_FIND_PLAY_SAFE', 'Find Advantage but Play Safe', 'Your player finds a hidden advantage but plays it safe and puts it back', -1, 'Advantages', true, 61, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_UPGRADE_TO_ADVANTAGE', 'Advantage Upgraded', 'Your advantage is upgraded to another advantage', 1, 'Advantages', false, 62, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_UPGRADE_TO_IDOL', 'Advantage Upgraded to Idol', 'Your advantage is upgraded to an immunity idol', 2, 'Advantages', false, 63, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_USE_SUCCESS_SELF', 'Use Advantage Successfully (Self)', 'Your player uses an advantage successfully for themselves', 5, 'Advantages', false, 64, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_USE_SUCCESS_OTHER', 'Use Advantage Successfully (Other)', 'Your player uses an advantage successfully for another player', 3, 'Advantages', false, 65, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_USE_UNSUCCESS', 'Use Advantage Unsuccessfully', 'Your player uses a real or fake advantage unsuccessfully for themselves or another player', -3, 'Advantages', true, 66, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_USED_AGAINST', 'Advantage Used Against You', 'A player uses an advantage against your player (eg steal vote, block vote, disadvantage in challenge)', -2, 'Advantages', true, 67, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_GIVE', 'Give Advantage to Another', 'Your player gives their advantage to another player', 1, 'Advantages', false, 68, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_RECEIVE', 'Receive Advantage from Another', 'Your player receives an advantage from another player', 1, 'Advantages', false, 69, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_RECEIVE_BACK', 'Receive Back Given Advantage', 'Your player receives back an advantage previously given to another player', 1, 'Advantages', false, 70, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_GIVE_BACK', 'Give Back Received Advantage', 'Your player gives back an advantage previously given to another player', 1, 'Advantages', false, 71, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_GAVE_NOT_RETURNED', 'Gave Advantage Not Returned', 'Your player gave an advantage to another player and does not receive it back', -1, 'Advantages', true, 72, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_GIVEN_KEPT', 'Given Advantage and Kept', 'Your player was given an advantage and does not give it back', 1, 'Advantages', false, 73, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_MAKE_FAKE', 'Make/Plant Fake Advantage', 'Your player makes and/or plants a fake advantage (only episode viewers learn)', 3, 'Advantages', false, 74, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_FAKE_FOUND', 'Fake Advantage Found', 'Your player''s fake advantage is found', 1, 'Advantages', false, 75, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_FIND_FAKE_BELIEVE', 'Find Fake Advantage and Believe', 'Your player finds a fake advantage and believes it is real', -1, 'Advantages', true, 76, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_FAKE_USED', 'Fake Advantage Used', 'Your player''s fake advantage is used as if it is real (only episode fake is used)', 1, 'Advantages', false, 77, true),

-- ============================================
-- HIDDEN IMMUNITY IDOLS SCORING
-- ============================================
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_FIND', 'Find Hidden Immunity Idol', 'Your player finds a hidden immunity idol (+7 only when viewers learn of it)', 7, 'Hidden Immunity Idols', false, 80, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_ACTIVATE', 'Activate Idol from Inactive', 'Your player activates a hidden immunity idol from an inactive idol by completing prerequisites', 1, 'Hidden Immunity Idols', false, 81, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_CLUE_NOT_FOUND', 'Idol Clue Not Found by Episode End', 'Your player has a clue to idol not found by episode end, or inactive idol not activated', -1, 'Hidden Immunity Idols', true, 82, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_ACTIVATE_FAIL', 'Fail to Activate Idol', 'Your player attempts to activate a real hidden immunity idol but fails', -1, 'Hidden Immunity Idols', true, 83, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_FIND_PLAY_SAFE', 'Find Idol but Play Safe', 'Your player finds a hidden immunity idol but plays it safe and puts it back', -1, 'Hidden Immunity Idols', true, 84, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_PLAY_SUCCESS_SELF', 'Play Idol Successfully (Self)', 'Your player plays a hidden immunity idol successfully for themselves', 3, 'Hidden Immunity Idols', false, 85, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_PLAY_SUCCESS_OTHER', 'Play Idol Successfully (Other)', 'Your player plays a hidden immunity idol successfully for another player', 5, 'Hidden Immunity Idols', false, 86, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_PLAY_UNSUCCESS', 'Play Idol Unsuccessfully', 'Your player uses a real or fake idol unsuccessfully for themselves or another player', -3, 'Hidden Immunity Idols', true, 87, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_GIVE', 'Give Idol to Another', 'Your player gives their hidden immunity idol to another player', 1, 'Hidden Immunity Idols', false, 88, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_RECEIVE', 'Receive Idol from Another', 'Your player receives a hidden immunity idol from another player', 1, 'Hidden Immunity Idols', false, 89, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_RECEIVE_BACK', 'Receive Back Given Idol', 'Your player receives back an idol previously given to another player', 1, 'Hidden Immunity Idols', false, 90, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_GIVE_BACK', 'Give Back Received Idol', 'Your player gives back an idol previously given to another player', 1, 'Hidden Immunity Idols', false, 91, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_GAVE_NOT_RETURNED', 'Gave Idol Not Returned', 'Your player gave an idol to another player and does not receive it back', -1, 'Hidden Immunity Idols', true, 92, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_GIVEN_KEPT', 'Given Idol and Kept', 'Your player was given an idol and does not give it back', 1, 'Hidden Immunity Idols', false, 93, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_MAKE_FAKE', 'Make/Plant Fake Idol', 'Your player makes and/or plants a fake hidden immunity idol (only episode viewers learn)', 3, 'Hidden Immunity Idols', false, 94, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_FAKE_FOUND', 'Fake Idol Found', 'Your player''s fake hidden immunity idol is found', 1, 'Hidden Immunity Idols', false, 95, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_FIND_FAKE_BELIEVE', 'Find Fake Idol and Believe', 'Your player finds a fake idol and believes it is real (Its a f***ing stick! incident)', -1, 'Hidden Immunity Idols', true, 96, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_FAKE_USED', 'Fake Idol Used', 'Your player''s fake idol is used as if it is real (only episode fake is used)', 1, 'Hidden Immunity Idols', false, 97, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'SHOT_DARK_SUCCESS', 'Shot in the Dark Successful', 'Your player uses their Shot in the Dark successfully', 5, 'Hidden Immunity Idols', false, 98, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'SHOT_DARK_FAIL', 'Shot in the Dark Unsuccessful', 'Your player uses their Shot in the Dark unsuccessfully (rewarded for taking risk)', 1, 'Hidden Immunity Idols', false, 99, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_SNUFFED_WITH', 'Snuffed with Idol', 'Your player has a hidden immunity idol, doesn''t play it, and gets snuffed, quits, or evacuated', -3, 'Hidden Immunity Idols', true, 100, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADV_SNUFFED_WITH', 'Snuffed with Advantage', 'Your player has an advantage, doesn''t play it, and gets snuffed, quits, or evacuated', -3, 'Hidden Immunity Idols', true, 101, true),

-- ============================================
-- RANDOM SCORING
-- ============================================
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'RAND_WARDROBE_MALFUNCTION', 'Wardrobe Malfunction', 'Wardrobe malfunction (more than blurring of a crack or through-the-pants)', 1, 'Random', false, 110, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'RAND_BACKGROUND_STORY', 'Background Story Told', 'Your player''s background story is told (eg flashback to pictures or videos)', 1, 'Random', false, 111, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'RAND_ROMANCE', 'Genuine Romance', 'A genuine romance involving your player (more than snuggling; only episode viewers learn)', 2, 'Random', false, 112, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'RAND_CRY_NEGATIVE', 'Crying (Negative Reasons)', 'Crying/brink of tears for negative reasons (upset, bullied)', -1, 'Random', true, 113, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'RAND_CRY_POSITIVE', 'Crying (Positive Reasons)', 'Crying/brink of tears for positive reasons (happy, proud, excited)', 1, 'Random', false, 114, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'RAND_CONFESSIONAL', 'Shown in Confessional', 'Your player is shown in a confessional', 0.5, 'Random', false, 115, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'RAND_SECRET_EAT', 'Secretly Eat Food', 'Your player secretly eats food and doesn''t share with the entire tribe', 2, 'Random', false, 116, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'RAND_MEDICAL_EVAL', 'Medical Evaluation', 'Your player gets medical evaluation but is not forced to leave from a medical evacuation', -1, 'Random', true, 117, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'RAND_MEDICAL_EVAC', 'Medical Evacuation', 'Your player is forced to leave from a medical evacuation', -7, 'Random', true, 118, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'RAND_QUIT', 'Quit the Game', 'Your player quits (leaves before going to tribal - different from saying vote me out)', -10, 'Random', true, 119, true),

-- ============================================
-- FINAL THREE
-- ============================================
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'FINAL_MAKE_FTC', 'Make Final Three', 'Your player makes it to the final three (or two if the season goes that way)', 5, 'Final Three', false, 120, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'FINAL_CHOSEN_FOR_FTC', 'Chosen for Final Three', 'You are chosen by another castaway to be in the final three', 2, 'Final Three', false, 121, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'FINAL_JURY_VOTE', 'Receive Jury Vote', 'Each vote your player receives in the final vote', 2, 'Final Three', false, 122, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'FINAL_WIN', 'Win the Season', 'Your player wins the season', 10, 'Final Three', false, 123, true);

SELECT
  'Season 50 seeded successfully!' AS status,
  (SELECT COUNT(*) FROM seasons WHERE number = 50) AS seasons,
  (SELECT COUNT(*) FROM castaways WHERE season_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890') AS castaways,
  (SELECT COUNT(*) FROM episodes WHERE season_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890') AS episodes,
  (SELECT COUNT(*) FROM scoring_rules WHERE season_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890') AS scoring_rules;
