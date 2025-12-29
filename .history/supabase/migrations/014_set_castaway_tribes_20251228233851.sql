-- ============================================
-- SET CASTAWAY TRIBES FOR SEASON 50
-- Migration 014: Assign castaways to their original tribes
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

  -- Tuku Tribe (Blue) - 8 castaways
  UPDATE castaways SET tribe_original = 'Tuku' 
  WHERE season_id = season_50_id AND name = 'Rob Mariano';
  
  UPDATE castaways SET tribe_original = 'Tuku' 
  WHERE season_id = season_50_id AND name = 'Sandra Diaz-Twine';
  
  UPDATE castaways SET tribe_original = 'Tuku' 
  WHERE season_id = season_50_id AND name = 'Tony Vlachos';
  
  UPDATE castaways SET tribe_original = 'Tuku' 
  WHERE season_id = season_50_id AND name = 'Cirie Fields';
  
  UPDATE castaways SET tribe_original = 'Tuku' 
  WHERE season_id = season_50_id AND name = 'Tyson Apostol';
  
  UPDATE castaways SET tribe_original = 'Tuku' 
  WHERE season_id = season_50_id AND name = 'Sarah Lacina';
  
  UPDATE castaways SET tribe_original = 'Tuku' 
  WHERE season_id = season_50_id AND name = 'Ben Driebergen';
  
  UPDATE castaways SET tribe_original = 'Tuku' 
  WHERE season_id = season_50_id AND name = 'Natalie Anderson';

  -- Gata Tribe (Yellow) - 8 castaways
  UPDATE castaways SET tribe_original = 'Gata' 
  WHERE season_id = season_50_id AND name = 'Parvati Shallow';
  
  UPDATE castaways SET tribe_original = 'Gata' 
  WHERE season_id = season_50_id AND name = 'Kim Spradlin-Wolfe';
  
  UPDATE castaways SET tribe_original = 'Gata' 
  WHERE season_id = season_50_id AND name = 'Jeremy Collins';
  
  UPDATE castaways SET tribe_original = 'Gata' 
  WHERE season_id = season_50_id AND name = 'Michele Fitzgerald';
  
  UPDATE castaways SET tribe_original = 'Gata' 
  WHERE season_id = season_50_id AND name = 'Wendell Holland';
  
  UPDATE castaways SET tribe_original = 'Gata' 
  WHERE season_id = season_50_id AND name = 'Sophie Clarke';
  
  UPDATE castaways SET tribe_original = 'Gata' 
  WHERE season_id = season_50_id AND name = 'Yul Kwon';
  
  UPDATE castaways SET tribe_original = 'Gata' 
  WHERE season_id = season_50_id AND name = 'Denise Stapley';

  -- Lavo Tribe (Red) - 8 castaways
  UPDATE castaways SET tribe_original = 'Lavo' 
  WHERE season_id = season_50_id AND name = 'Ethan Zohn';
  
  UPDATE castaways SET tribe_original = 'Lavo' 
  WHERE season_id = season_50_id AND name = 'Tina Wesson';
  
  UPDATE castaways SET tribe_original = 'Lavo' 
  WHERE season_id = season_50_id AND name = 'Earl Cole';
  
  UPDATE castaways SET tribe_original = 'Lavo' 
  WHERE season_id = season_50_id AND name = 'JT Thomas';
  
  UPDATE castaways SET tribe_original = 'Lavo' 
  WHERE season_id = season_50_id AND name = 'Vecepia Towery';
  
  UPDATE castaways SET tribe_original = 'Lavo' 
  WHERE season_id = season_50_id AND name = 'Danni Boatwright';
  
  UPDATE castaways SET tribe_original = 'Lavo' 
  WHERE season_id = season_50_id AND name = 'Adam Klein';
  
  UPDATE castaways SET tribe_original = 'Lavo' 
  WHERE season_id = season_50_id AND name = 'Nick Wilson';
END $$;

-- Verify update
SELECT tribe_original, COUNT(*) as count 
FROM castaways 
WHERE tribe_original IS NOT NULL 
GROUP BY tribe_original 
ORDER BY tribe_original;
