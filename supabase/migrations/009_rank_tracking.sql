-- ============================================
-- RANK TRACKING
-- Add previous_rank to track movement in standings
-- ============================================

-- Add previous_rank column to league_members
ALTER TABLE league_members ADD COLUMN IF NOT EXISTS previous_rank INTEGER;

-- Comment explaining the purpose
COMMENT ON COLUMN league_members.previous_rank IS 'Rank from the previous episode, used to calculate movement indicators';

-- Update previous_rank before calculating new rankings (call this before updating rank)
CREATE OR REPLACE FUNCTION update_previous_ranks(league_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE league_members
  SET previous_rank = rank
  WHERE league_id = league_uuid;
END;
$$ LANGUAGE plpgsql;
