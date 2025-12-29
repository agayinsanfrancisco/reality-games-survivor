-- ============================================
-- INSERT TRIVIA QUESTIONS
-- Migration 032: Insert all 24 trivia questions for Season 50
-- ============================================

-- Clear existing questions (if any)
DELETE FROM daily_trivia_questions;

-- Insert all 24 trivia questions
INSERT INTO daily_trivia_questions (question_number, question, options, correct_index, fun_fact) VALUES
(1, 'Which Survivor 50 contestant holds the record for competing in the most seasons (including international)?', 
  ARRAY['Ozzy Lusth', 'Cirie Fields', 'Joe Anglim', 'Colby Donaldson'], 
  1, 'Cirie has played 5 times: Panama, Micronesia, HvV, Game Changers, and Australian Survivor'),

(2, 'In David vs. Goliath (S37), what was the final jury vote when Nick Wilson won?', 
  ARRAY['7-3-0 (Nick-Mike-Angelina)', '6-2-2 (Nick-Mike-Angelina)', '5-3-2 (Nick-Mike-Angelina)', '8-0-0 (Nick unanimous)'], 
  0, 'Angelina received zero jury votes despite making it to Final Tribal Council'),

(3, 'Which contestant was the LAST person standing from the infamous Ulong tribe in Palau?', 
  ARRAY['Tom Westman', 'Katie Gallagher', 'Stephenie LaGrossa', 'Bobby Jon Drinkard'], 
  2, 'Ulong lost every single immunity challenge, and Stephenie survived alone before being absorbed into Koror'),

(4, 'How many individual immunity challenges did Savannah Louie win in Season 49?', 
  ARRAY['2', '3', '4', '5'], 
  2, 'Savannah tied the record for most immunity wins by a woman in a single season'),

(5, 'Which Survivor 50 contestant collapsed during an immunity challenge due to exhaustion?', 
  ARRAY['Jonathan Young', 'Joe Anglim', 'Ozzy Lusth', 'Coach Wade'], 
  1, 'Joe collapsed on Day 32 of Cambodia after pushing himself to the limit'),

(6, 'Genevieve Mushaluk was known in Season 47 for being the queen of what?', 
  ARRAY['Immunity wins', 'Blindsides', 'Finding idols', 'Social gameplay'], 
  1, 'Genevieve orchestrated multiple blindsides including the Kishan vote and Operation: Italy'),

(7, 'Which two Survivor 50 contestants competed on the same original season and later got married?', 
  ARRAY['Ozzy Lusth & Amanda Kimmel', 'Joe Anglim & Sierra Dawn Thomas', 'Colby Donaldson & Jerri Manthey', 'Coach Wade & Debbie Beebe'], 
  1, 'Joe and Sierra met on Worlds Apart (S30) and married in 2019'),

(8, 'Kyle Fraser won Survivor 48 with what final jury vote?', 
  ARRAY['7-1-0', '6-2-0', '5-2-1', '4-3-1'], 
  2, 'All three finalists (Kyle, Eva, Joe) received at least one vote - a rare occurrence'),

(9, 'Tiffany Ervin was blindsided in Season 46 while holding what in her pocket?', 
  ARRAY['An extra vote', 'A hidden immunity idol', 'A fake idol', 'Shot in the dark'], 
  1, 'Tiffany was blindsided at Final 8 with an idol after Q exposed her advantage to the tribe'),

(10, 'How many Hidden Immunity Idols did Rick Devens possess during Edge of Extinction (S38)?', 
  ARRAY['2', '3', '4', '5'], 
  2, 'Rick holds the record for most idols possessed in a single season with 4'),

(11, 'In Australian Outback, Colby made a controversial decision at Final 3. What did he do?', 
  ARRAY['Kept the immunity necklace', 'Took Tina instead of Keith to Final 2', 'Refused to vote', 'Gave away his reward'], 
  1, 'Colby''s decision to take Tina cost him $1 million - she won 4-3'),

(12, 'How many times has Ozzy Lusth competed on Survivor?', 
  ARRAY['2', '3', '4', '5'], 
  2, 'Ozzy played in Cook Islands, Micronesia, South Pacific, and Game Changers'),

(13, 'What is Coach Wade''s self-proclaimed nickname?', 
  ARRAY['The Warrior', 'The Dragon Slayer', 'The Maestro', 'The Survivor'], 
  1, 'Coach''s eccentric personality and stories made him one of Survivor''s most memorable characters'),

(14, 'In Kaôh Rōng, Aubry lost the final jury vote to which winner?', 
  ARRAY['Natalie Anderson', 'Michele Fitzgerald', 'Sarah Lacina', 'Wendell Holland'], 
  1, 'The jury vote was 5-2 in favor of Michele in one of Survivor''s most debated outcomes'),

(15, 'What is Christian Hubicki''s profession outside of Survivor?', 
  ARRAY['Software Engineer', 'Robotics Scientist', 'Data Analyst', 'Math Teacher'], 
  1, 'Christian''s nerdy charm and puzzle-solving skills made him a fan favorite in David vs. Goliath'),

(16, 'Mike White is known outside Survivor for creating which hit TV show?', 
  ARRAY['Succession', 'The White Lotus', 'Yellowjackets', 'The Bear'], 
  1, 'Mike finished 2nd on David vs. Goliath and later won multiple Emmys for The White Lotus'),

(17, 'How many individual immunity challenges did Chrissy Hofbeck win in Heroes vs. Healers vs. Hustlers?', 
  ARRAY['2', '3', '4', '5'], 
  2, 'Chrissy tied the women''s record for immunity wins at the time with 4 necklaces'),

(18, 'Jonathan Young was known in Season 42 for his dominance in what area?', 
  ARRAY['Puzzle solving', 'Physical challenges', 'Finding idols', 'Social manipulation'], 
  1, 'Jonathan''s incredible strength carried his tribe through the pre-merge challenges'),

(19, 'Dee Valladares won Season 45 with what final jury vote?', 
  ARRAY['7-1-0', '6-2-0', '5-3-0', '4-3-1'], 
  2, 'Dee dominated Season 45 and is considered one of the best New Era winners'),

(20, 'Emily Flippen was known early in Season 45 for being extremely:', 
  ARRAY['Strategic', 'Physical', 'Blunt and abrasive', 'Under the radar'], 
  2, 'Emily had one of the best redemption arcs, going from most disliked to respected player'),

(21, 'Q Burdette became infamous in Season 46 for repeatedly doing what at Tribal Council?', 
  ARRAY['Refusing to vote', 'Asking to be voted out', 'Playing fake idols', 'Switching his vote last second'], 
  1, 'Q''s chaotic gameplay including asking to go home made him one of the most unpredictable players ever'),

(22, 'Charlie Davis finished as runner-up in Season 46, losing to which winner?', 
  ARRAY['Maria Shrime Gonzalez', 'Kenzie Petty', 'Ben Katzman', 'Liz Wilcox'], 
  1, 'Charlie lost 5-3-0 despite being considered one of the best strategic players of the season'),

(23, 'Kamilla Karthigesu was eliminated in Season 48 by losing what challenge?', 
  ARRAY['Final immunity', 'Firemaking', 'Rock draw', 'Shot in the dark'], 
  1, 'The jury confirmed Kamilla would have won if she made Final Tribal Council'),

(24, 'Rizo Velovic holds what distinction as a Survivor contestant?', 
  ARRAY['First Gen Z winner', 'First Albanian-American contestant', 'Youngest male finalist', 'Most idols found by a rookie'], 
  1, 'Rizo, aka ''Rizgod,'' was a superfan who became the first Albanian-American on the show');

-- Verify all questions were inserted
DO $$
DECLARE
  question_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO question_count FROM daily_trivia_questions WHERE question_number IS NOT NULL;
  IF question_count != 24 THEN
    RAISE EXCEPTION 'Expected 24 questions, but found %', question_count;
  END IF;
END $$;

COMMENT ON TABLE daily_trivia_questions IS 'All 24 trivia questions for Season 50 - users can answer all in one day, locked out 24h if wrong';
