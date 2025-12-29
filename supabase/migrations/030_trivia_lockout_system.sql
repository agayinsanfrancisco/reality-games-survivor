-- ============================================
-- TRIVIA LOCKOUT SYSTEM
-- Migration 030: Track trivia answers with 24-hour lockout on wrong answer
-- ============================================

-- Add lockout field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS trivia_lockout_until TIMESTAMPTZ;

-- Create table to track trivia answers (using question index 0-23)
CREATE TABLE IF NOT EXISTS trivia_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL CHECK (question_index >= 0 AND question_index < 24),
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_index) -- One answer per user per question
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trivia_answers_user_id ON trivia_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_trivia_answers_question_index ON trivia_answers(question_index);
CREATE INDEX IF NOT EXISTS idx_trivia_answers_user_answered ON trivia_answers(user_id, answered_at DESC);

-- RLS Policies
ALTER TABLE trivia_answers ENABLE ROW LEVEL SECURITY;

-- Users can only insert their own answers
CREATE POLICY "Users can insert their own answers"
  ON trivia_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own answers
CREATE POLICY "Users can read their own answers"
  ON trivia_answers FOR SELECT
  USING (auth.uid() = user_id);

-- Function to check if user is locked out
CREATE OR REPLACE FUNCTION is_user_trivia_locked_out(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  lockout_time TIMESTAMPTZ;
BEGIN
  SELECT trivia_lockout_until INTO lockout_time
  FROM users
  WHERE id = p_user_id;
  
  IF lockout_time IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN lockout_time > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's trivia progress
CREATE OR REPLACE FUNCTION get_user_trivia_progress(p_user_id UUID)
RETURNS TABLE (
  total_answered INTEGER,
  total_correct INTEGER,
  is_locked_out BOOLEAN,
  lockout_until TIMESTAMPTZ,
  answered_questions INTEGER[] -- Array of question indices that have been answered
) AS $$
BEGIN
  RETURN QUERY
  WITH user_answers AS (
    SELECT question_index, is_correct
    FROM trivia_answers
    WHERE user_id = p_user_id
  ),
  user_lockout AS (
    SELECT trivia_lockout_until
    FROM users
    WHERE id = p_user_id
  )
  SELECT 
    (SELECT COUNT(*) FROM user_answers)::INTEGER as total_answered,
    (SELECT COUNT(*) FROM user_answers WHERE is_correct = true)::INTEGER as total_correct,
    COALESCE((SELECT (trivia_lockout_until > NOW()) FROM user_lockout), false) as is_locked_out,
    (SELECT trivia_lockout_until FROM user_lockout) as lockout_until,
    (SELECT ARRAY_AGG(question_index ORDER BY question_index) FROM user_answers) as answered_questions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE trivia_answers IS 'User answers to trivia questions (24 total, indexed 0-23)';
COMMENT ON COLUMN users.trivia_lockout_until IS 'Timestamp when user can answer trivia again after getting a question wrong';
COMMENT ON FUNCTION is_user_trivia_locked_out IS 'Check if user is currently locked out from trivia';
COMMENT ON FUNCTION get_user_trivia_progress IS 'Get user progress through all 24 trivia questions';
