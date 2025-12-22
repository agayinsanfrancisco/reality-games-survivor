-- ============================================
-- CASTAWAY TRIVIA FIELDS
-- Add fields for previous seasons, best placement, and fun facts
-- ============================================

-- Add trivia columns to castaways table
ALTER TABLE castaways ADD COLUMN IF NOT EXISTS previous_seasons TEXT[];
ALTER TABLE castaways ADD COLUMN IF NOT EXISTS best_placement INTEGER;
ALTER TABLE castaways ADD COLUMN IF NOT EXISTS fun_fact TEXT;

-- Add an index for fast lookup
CREATE INDEX IF NOT EXISTS idx_castaways_best_placement ON castaways(best_placement) WHERE best_placement IS NOT NULL;

COMMENT ON COLUMN castaways.previous_seasons IS 'Array of previous season names/numbers the castaway appeared on';
COMMENT ON COLUMN castaways.best_placement IS 'Best placement achieved in previous seasons (1 = winner)';
COMMENT ON COLUMN castaways.fun_fact IS 'Interesting trivia about the castaway from Survivor Wiki';
