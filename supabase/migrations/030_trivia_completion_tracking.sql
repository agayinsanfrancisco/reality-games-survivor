-- ============================================
-- TRIVIA COMPLETION TRACKING
-- Migration 030: Track one-time trivia quiz completion
-- ============================================

-- Add trivia completion tracking to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS trivia_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trivia_completed_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trivia_score INTEGER;

-- Add index for quick lookup
CREATE INDEX IF NOT EXISTS idx_users_trivia_completed ON users(trivia_completed) WHERE trivia_completed = true;

COMMENT ON COLUMN users.trivia_completed IS 'Whether user has completed the one-time trivia quiz';
COMMENT ON COLUMN users.trivia_completed_at IS 'When user completed the trivia quiz';
COMMENT ON COLUMN users.trivia_score IS 'Final score from trivia quiz (out of total questions)';
