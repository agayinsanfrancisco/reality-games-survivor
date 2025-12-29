-- ============================================
-- TRIVIA LOCKOUT COLUMN
-- Migration 030: Add lockout tracking for trivia
-- ============================================

-- Add lockout column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS trivia_lockout_until TIMESTAMPTZ;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_trivia_lockout ON users(trivia_lockout_until) WHERE trivia_lockout_until IS NOT NULL;

COMMENT ON COLUMN users.trivia_lockout_until IS 'Timestamp when user can resume trivia after missing a question (24 hour lockout)';
