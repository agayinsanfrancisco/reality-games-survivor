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
  'Survivor 50: The Greatest',
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
INSERT INTO castaways (id, season_id, name, age, hometown, occupation, tribe_original, status) VALUES
-- Tuku Tribe (Blue)
('c001-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Rob Mariano', 48, 'Boston, MA', 'TV Personality', 'Tuku', 'active'),
('c001-0001-0001-0001-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sandra Diaz-Twine', 50, 'Stamford, CT', 'Military Veteran', 'Tuku', 'active'),
('c001-0001-0001-0001-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Tony Vlachos', 50, 'Jersey City, NJ', 'Police Officer', 'Tuku', 'active'),
('c001-0001-0001-0001-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cirie Fields', 53, 'Jersey City, NJ', 'Nurse', 'Tuku', 'active'),
('c001-0001-0001-0001-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Tyson Apostol', 45, 'Lindon, UT', 'Podcaster', 'Tuku', 'active'),
('c001-0001-0001-0001-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sarah Lacina', 40, 'Marion, IA', 'Police Officer', 'Tuku', 'active'),
('c001-0001-0001-0001-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ben Driebergen', 43, 'Boise, ID', 'Marine Veteran', 'Tuku', 'active'),
('c001-0001-0001-0001-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Natalie Anderson', 38, 'Edgewater, NJ', 'Crossfit Trainer', 'Tuku', 'active'),

-- Gata Tribe (Yellow)
('c001-0001-0001-0001-000000000009', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Parvati Shallow', 42, 'Los Angeles, CA', 'TV Host', 'Gata', 'active'),
('c001-0001-0001-0001-000000000010', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Kim Spradlin-Wolfe', 42, 'San Antonio, TX', 'Interior Designer', 'Gata', 'active'),
('c001-0001-0001-0001-000000000011', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Jeremy Collins', 46, 'Foxboro, MA', 'Firefighter', 'Gata', 'active'),
('c001-0001-0001-0001-000000000012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Michele Fitzgerald', 34, 'Freehold, NJ', 'Social Media Manager', 'Gata', 'active'),
('c001-0001-0001-0001-000000000013', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Wendell Holland', 39, 'Philadelphia, PA', 'Furniture Designer', 'Gata', 'active'),
('c001-0001-0001-0001-000000000014', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sophie Clarke', 34, 'Willsboro, NY', 'Healthcare Consultant', 'Gata', 'active'),
('c001-0001-0001-0001-000000000015', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Yul Kwon', 49, 'San Mateo, CA', 'Tech Executive', 'Gata', 'active'),
('c001-0001-0001-0001-000000000016', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Denise Stapley', 54, 'Cedar Rapids, IA', 'Therapist', 'Gata', 'active'),

-- Lavo Tribe (Red)
('c001-0001-0001-0001-000000000017', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ethan Zohn', 51, 'Lexington, MA', 'Soccer Coach', 'Lavo', 'active'),
('c001-0001-0001-0001-000000000018', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Tina Wesson', 62, 'Knoxville, TN', 'Personal Trainer', 'Lavo', 'active'),
('c001-0001-0001-0001-000000000019', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Earl Cole', 55, 'Los Angeles, CA', 'Executive Recruiter', 'Lavo', 'active'),
('c001-0001-0001-0001-000000000020', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'JT Thomas', 39, 'Samson, AL', 'Cattle Rancher', 'Lavo', 'active'),
('c001-0001-0001-0001-000000000021', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Vecepia Towery', 58, 'Portland, OR', 'Office Manager', 'Lavo', 'active'),
('c001-0001-0001-0001-000000000022', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Danni Boatwright', 50, 'Tonganoxie, KS', 'Sports Radio Host', 'Lavo', 'active'),
('c001-0001-0001-0001-000000000023', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Adam Klein', 32, 'San Francisco, CA', 'Podcaster', 'Lavo', 'active'),
('c001-0001-0001-0001-000000000024', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Nick Wilson', 35, 'Williamsburg, KY', 'Public Defender', 'Lavo', 'active');

-- ============================================
-- EPISODES (14 episodes for Season 50)
-- ============================================
INSERT INTO episodes (id, season_id, number, title, air_date, picks_lock_at, results_posted_at, waiver_opens_at, waiver_closes_at, is_finale) VALUES
('e001-0001-0001-0001-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, 'The Greatest Showdown Begins', '2026-02-25 20:00:00-08', '2026-02-25 15:00:00-08', '2026-02-27 12:00:00-08', '2026-02-28 12:00:00-08', '2026-03-04 15:00:00-08', false),
('e001-0001-0001-0001-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2, 'Legends Collide', '2026-03-04 20:00:00-08', '2026-03-04 15:00:00-08', '2026-03-06 12:00:00-08', '2026-03-07 12:00:00-08', '2026-03-11 15:00:00-08', false),
('e001-0001-0001-0001-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 3, 'Trust No One', '2026-03-11 20:00:00-08', '2026-03-11 15:00:00-08', '2026-03-13 12:00:00-08', '2026-03-14 12:00:00-07', '2026-03-18 15:00:00-07', false),
('e001-0001-0001-0001-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 4, 'Shifting Alliances', '2026-03-18 20:00:00-07', '2026-03-18 15:00:00-07', '2026-03-20 12:00:00-07', '2026-03-21 12:00:00-07', '2026-03-25 15:00:00-07', false),
('e001-0001-0001-0001-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 5, 'Tribe Swap Chaos', '2026-03-25 20:00:00-07', '2026-03-25 15:00:00-07', '2026-03-27 12:00:00-07', '2026-03-28 12:00:00-07', '2026-04-01 15:00:00-07', false),
('e001-0001-0001-0001-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 6, 'Merge Madness', '2026-04-01 20:00:00-07', '2026-04-01 15:00:00-07', '2026-04-03 12:00:00-07', '2026-04-04 12:00:00-07', '2026-04-08 15:00:00-07', false),
('e001-0001-0001-0001-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 7, 'Individual Immunity', '2026-04-08 20:00:00-07', '2026-04-08 15:00:00-07', '2026-04-10 12:00:00-07', '2026-04-11 12:00:00-07', '2026-04-15 15:00:00-07', false),
('e001-0001-0001-0001-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 8, 'Idol Frenzy', '2026-04-15 20:00:00-07', '2026-04-15 15:00:00-07', '2026-04-17 12:00:00-07', '2026-04-18 12:00:00-07', '2026-04-22 15:00:00-07', false),
('e001-0001-0001-0001-000000000009', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 9, 'Blindside Boulevard', '2026-04-22 20:00:00-07', '2026-04-22 15:00:00-07', '2026-04-24 12:00:00-07', '2026-04-25 12:00:00-07', '2026-04-29 15:00:00-07', false),
('e001-0001-0001-0001-000000000010', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 10, 'The Auction Returns', '2026-04-29 20:00:00-07', '2026-04-29 15:00:00-07', '2026-05-01 12:00:00-07', '2026-05-02 12:00:00-07', '2026-05-06 15:00:00-07', false),
('e001-0001-0001-0001-000000000011', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 11, 'Endgame Begins', '2026-05-06 20:00:00-07', '2026-05-06 15:00:00-07', '2026-05-08 12:00:00-07', '2026-05-09 12:00:00-07', '2026-05-13 15:00:00-07', false),
('e001-0001-0001-0001-000000000012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 12, 'Family Visit', '2026-05-13 20:00:00-07', '2026-05-13 15:00:00-07', '2026-05-15 12:00:00-07', '2026-05-16 12:00:00-07', '2026-05-20 15:00:00-07', false),
('e001-0001-0001-0001-000000000013', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 13, 'Final Four Frenzy', '2026-05-20 20:00:00-07', '2026-05-20 15:00:00-07', '2026-05-22 12:00:00-07', '2026-05-23 12:00:00-07', '2026-05-27 15:00:00-07', false),
('e001-0001-0001-0001-000000000014', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 14, 'Reunion & Finale', '2026-05-27 20:00:00-07', '2026-05-27 15:00:00-07', '2026-05-29 12:00:00-07', NULL, NULL, true);

-- ============================================
-- SCORING RULES (100+ rules)
-- ============================================
INSERT INTO scoring_rules (season_id, code, name, description, points, category, is_negative, sort_order, is_active) VALUES
-- Tribal Council
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'SURVIVE', 'Survive Tribal', 'Attend tribal council and not get voted out', 5, 'Tribal Council', false, 1, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'VOTE_CORRECT', 'Correct Vote', 'Vote for the person who gets eliminated', 3, 'Tribal Council', false, 2, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'VOTE_WRONG', 'Wrong Vote', 'Vote for someone who does not get eliminated', -1, 'Tribal Council', true, 3, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BLINDSIDE', 'Orchestrate Blindside', 'Lead the charge on a blindside vote', 10, 'Tribal Council', false, 4, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BLINDSIDED', 'Get Blindsided', 'Eliminated without seeing it coming', -5, 'Tribal Council', true, 5, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'NO_VOTES', 'No Votes Received', 'Receive zero votes at tribal', 3, 'Tribal Council', false, 6, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'VOTE_RECEIVED', 'Receive Vote', 'Each vote received against you', -1, 'Tribal Council', true, 7, true),

-- Immunity Challenges
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IND_IMMUNITY', 'Win Individual Immunity', 'Win an individual immunity challenge', 10, 'Challenges', false, 10, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'TRIBE_IMMUNITY', 'Win Tribal Immunity', 'Win immunity for your tribe', 5, 'Challenges', false, 11, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'CHALLENGE_SIT', 'Sit Out Challenge', 'Chosen to sit out of a challenge', -2, 'Challenges', true, 12, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'CHALLENGE_HERO', 'Challenge MVP', 'Be the standout performer in challenge', 5, 'Challenges', false, 13, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'LAST_PLACE', 'Last Place Individual', 'Finish last in individual challenge', -2, 'Challenges', true, 14, true),

-- Reward Challenges
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'REWARD_WIN', 'Win Reward', 'Win a reward challenge', 5, 'Rewards', false, 20, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'REWARD_SHARED', 'Share Reward', 'Give up your reward spot for another', 3, 'Rewards', false, 21, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'REWARD_PICKED', 'Picked for Reward', 'Chosen by winner to join reward', 2, 'Rewards', false, 22, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'AUCTION_WIN', 'Win Auction Item', 'Win an item at the Survivor auction', 3, 'Rewards', false, 23, true),

-- Hidden Immunity Idols
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_FIND', 'Find Hidden Idol', 'Find a hidden immunity idol', 10, 'Idols', false, 30, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_PLAY_SELF', 'Play Idol on Self', 'Play idol to save yourself', 5, 'Idols', false, 31, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_PLAY_OTHER', 'Play Idol on Another', 'Play idol to save someone else', 8, 'Idols', false, 32, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_NEGATE', 'Idol Negates Votes', 'Idol play successfully negates votes', 5, 'Idols', false, 33, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_WASTED', 'Wasted Idol', 'Play idol when not needed', -3, 'Idols', true, 34, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_FLUSH', 'Flush Someone Idol', 'Force someone to play their idol', 5, 'Idols', false, 35, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_ELIMINATED', 'Eliminated with Idol', 'Get voted out while holding an idol', -10, 'Idols', true, 36, true),

-- Advantages
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADVANTAGE_FIND', 'Find Advantage', 'Find any game advantage', 7, 'Advantages', false, 40, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ADVANTAGE_PLAY', 'Play Advantage', 'Successfully use an advantage', 5, 'Advantages', false, 41, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EXTRA_VOTE', 'Extra Vote Used', 'Use an extra vote advantage', 5, 'Advantages', false, 42, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'STEAL_VOTE', 'Steal a Vote', 'Use a steal a vote advantage', 7, 'Advantages', false, 43, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'VOTE_BLOCKER', 'Block a Vote', 'Block someone from voting', 5, 'Advantages', false, 44, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'SHOT_DARK', 'Shot in the Dark', 'Use the Shot in the Dark die', 2, 'Advantages', false, 45, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'SHOT_DARK_SAFE', 'Safe from Shot in Dark', 'Saved by Shot in the Dark', 10, 'Advantages', false, 46, true),

-- Social Game
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ALLIANCE_FORM', 'Form Alliance', 'Create a new alliance', 5, 'Social', false, 50, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ALLIANCE_BETRAY', 'Betray Alliance', 'Vote out an ally', 3, 'Social', false, 51, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'FLIP', 'Flip to Other Side', 'Change alliances during vote', 5, 'Social', false, 52, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'TARGET_SAVE', 'Save Target', 'Convince group to change vote target', 7, 'Social', false, 53, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'CONFESSIONAL', 'Featured Confessional', 'Have a memorable confessional moment', 2, 'Social', false, 54, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'CAMP_CONFLICT', 'Involved in Camp Conflict', 'Be in a camp argument shown on TV', -2, 'Social', true, 55, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'CRY', 'Crying on Camera', 'Cry during the episode', 1, 'Social', false, 56, true),

-- Strategic Moves
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'SPLIT_VOTE', 'Execute Split Vote', 'Successfully split votes', 5, 'Strategy', false, 60, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'FAKE_IDOL', 'Create Fake Idol', 'Make and plant a fake idol', 5, 'Strategy', false, 61, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'IDOL_BLUFF', 'Successful Idol Bluff', 'Bluff having an idol to influence vote', 5, 'Strategy', false, 62, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INFO_SHARE', 'Share Key Info', 'Share critical game information', 3, 'Strategy', false, 63, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'LIE_SUCCESS', 'Successful Lie', 'Tell a lie that affects the game', 3, 'Strategy', false, 64, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'LIE_CAUGHT', 'Caught in a Lie', 'Get caught lying', -3, 'Strategy', true, 65, true),

-- Camp Life
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'FIRE_MAKE', 'Make Fire at Camp', 'Make fire without flint', 5, 'Camp Life', false, 70, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'CATCH_FISH', 'Catch Fish/Food', 'Catch fish or find food for tribe', 3, 'Camp Life', false, 71, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PROVIDER', 'Camp Provider', 'Designated as camp provider', 3, 'Camp Life', false, 72, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'INJURY', 'Suffer Injury', 'Get injured during the game', -2, 'Camp Life', true, 73, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'MEDICAL_EVAC', 'Medical Evacuation', 'Removed from game for medical reasons', -20, 'Camp Life', true, 74, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'QUIT', 'Quit the Game', 'Voluntarily leave the game', -25, 'Camp Life', true, 75, true),

-- Tribe Swap & Merge
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'SWAP_MAJORITY', 'On Majority After Swap', 'End up in majority after tribe swap', 3, 'Game Events', false, 80, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'SWAP_MINORITY', 'On Minority After Swap', 'End up in minority after tribe swap', -2, 'Game Events', true, 81, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'MERGE_SURVIVE', 'Make the Merge', 'Survive to the merge', 10, 'Game Events', false, 82, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'JURY_MEMBER', 'Become Jury Member', 'Voted out but make the jury', 5, 'Game Events', false, 83, true),

-- Final Tribal & Endgame
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'FINAL_5', 'Reach Final 5', 'Make it to final 5', 10, 'Endgame', false, 90, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'FINAL_4', 'Reach Final 4', 'Make it to final 4', 15, 'Endgame', false, 91, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'FIREMAKING', 'Win Firemaking Challenge', 'Win the final 4 firemaking challenge', 15, 'Endgame', false, 92, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'FIREMAKING_LOSE', 'Lose Firemaking', 'Lose firemaking and get eliminated', -5, 'Endgame', true, 93, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'FTC_REACH', 'Reach Final Tribal', 'Make it to Final Tribal Council', 20, 'Endgame', false, 94, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'JURY_VOTE', 'Receive Jury Vote', 'Each jury vote received', 5, 'Endgame', false, 95, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'SOLE_SURVIVOR', 'Win Sole Survivor', 'Win the game and become Sole Survivor', 50, 'Endgame', false, 96, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'RUNNER_UP', 'Runner Up', 'Finish in second place', 25, 'Endgame', false, 97, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'THIRD_PLACE', 'Third Place', 'Finish in third place', 15, 'Endgame', false, 98, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ZERO_VOTES_FTC', 'Zero Votes at FTC', 'Receive no jury votes at Final Tribal', -10, 'Endgame', true, 99, true),

-- Bonus Points
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'QUOTE_ICONIC', 'Iconic Quote', 'Say something memorable/quotable', 3, 'Bonus', false, 100, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'HASHTAG', 'Get a Hashtag', 'CBS puts a hashtag on screen', 2, 'Bonus', false, 101, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'OPENING_CREDITS', 'Final Words/Opening', 'Featured in opening or closing', 1, 'Bonus', false, 102, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'EPISODE_TITLE', 'Episode Title', 'Episode is named after your quote', 5, 'Bonus', false, 103, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PLAYER_MOMENT', 'Player of the Week', 'Have the biggest impact this episode', 10, 'Bonus', false, 104, true),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'TORCH_SNUFF', 'Torch is Snuffed', 'Eliminated from the game', -15, 'Bonus', true, 105, true);

-- ============================================
-- GLOBAL LEAGUE FOR SEASON 50
-- ============================================
-- Note: Commissioner should be set to an admin user - update after admin account created
-- INSERT INTO leagues (id, season_id, name, code, commissioner_id, is_global, max_players, status)
-- VALUES (
--   'l001-0001-0001-0001-000000000001',
--   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
--   'Global Rankings - Season 50',
--   'GLOBAL',
--   'ADMIN_USER_ID_HERE',
--   true,
--   100000,
--   'forming'
-- );

SELECT
  'Season 50 seeded successfully!' AS status,
  (SELECT COUNT(*) FROM seasons WHERE number = 50) AS seasons,
  (SELECT COUNT(*) FROM castaways WHERE season_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890') AS castaways,
  (SELECT COUNT(*) FROM episodes WHERE season_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890') AS episodes,
  (SELECT COUNT(*) FROM scoring_rules WHERE season_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890') AS scoring_rules;
