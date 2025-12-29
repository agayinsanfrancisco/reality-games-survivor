-- ============================================
-- TRIVIA ATTEMPTS TRACKING
-- Migration 034: Add attempts column to track how many tries to complete
-- ============================================

-- Add attempts column to users table to track lockouts
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS trivia_attempts INTEGER DEFAULT 0;

-- Add attempts column to leaderboard
ALTER TABLE daily_trivia_leaderboard
ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 1;

-- Update existing leaderboard entries to have attempts = 1 (minimum)
UPDATE daily_trivia_leaderboard SET attempts = 1 WHERE attempts IS NULL OR attempts = 0;

COMMENT ON COLUMN users.trivia_attempts IS 'Number of times user has been locked out (wrong answers)';
COMMENT ON COLUMN daily_trivia_leaderboard.attempts IS 'Number of attempts (lockouts + 1) to complete all 24 questions';
