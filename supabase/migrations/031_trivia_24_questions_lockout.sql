-- ============================================
-- TRIVIA 24 QUESTIONS WITH LOCKOUT
-- Migration 031: Update trivia system to allow all 24 questions per day with 24h lockout on wrong answer
-- ============================================

-- Add lockout tracking to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS trivia_locked_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trivia_questions_answered INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS trivia_questions_correct INTEGER DEFAULT 0;

-- Update daily_trivia_questions to remove UNIQUE constraint on question_date
-- (we'll have 24 questions total, not one per day)
ALTER TABLE daily_trivia_questions 
DROP CONSTRAINT IF EXISTS daily_trivia_questions_question_date_key;

-- Add question_number column to track order (1-24)
ALTER TABLE daily_trivia_questions
ADD COLUMN IF NOT EXISTS question_number INTEGER;

-- Create index for question ordering
CREATE INDEX IF NOT EXISTS idx_daily_trivia_questions_number ON daily_trivia_questions(question_number ASC);

-- Function to check if user is locked out
CREATE OR REPLACE FUNCTION is_user_trivia_locked(p_user_id UUID)
RETURNS TABLE (is_user_trivia_locked BOOLEAN) AS $$
DECLARE
  locked_until TIMESTAMPTZ;
  is_locked BOOLEAN;
BEGIN
  SELECT trivia_locked_until INTO locked_until
  FROM users
  WHERE id = p_user_id;
  
  IF locked_until IS NULL THEN
    is_locked := FALSE;
  ELSIF locked_until > NOW() THEN
    is_locked := TRUE;
  ELSE
    -- Lockout expired, clear it
    UPDATE users SET trivia_locked_until = NULL WHERE id = p_user_id;
    is_locked := FALSE;
  END IF;
  
  RETURN QUERY SELECT is_locked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's next unanswered question
CREATE OR REPLACE FUNCTION get_next_trivia_question(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  question_number INTEGER,
  question TEXT,
  options TEXT[],
  correct_index INTEGER,
  fun_fact TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dtq.id,
    dtq.question_number,
    dtq.question,
    dtq.options,
    dtq.correct_index,
    dtq.fun_fact
  FROM daily_trivia_questions dtq
  WHERE dtq.question_number IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 
      FROM daily_trivia_answers dta
      WHERE dta.user_id = p_user_id 
        AND dta.question_id = dtq.id
        AND dta.is_correct = true
    )
  ORDER BY dtq.question_number ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's progress
CREATE OR REPLACE FUNCTION get_trivia_progress(p_user_id UUID)
RETURNS TABLE (
  total_questions INTEGER,
  questions_answered INTEGER,
  questions_correct INTEGER,
  is_locked BOOLEAN,
  locked_until TIMESTAMPTZ,
  is_complete BOOLEAN
) AS $$
DECLARE
  total_count INTEGER;
  answered_count INTEGER;
  correct_count INTEGER;
  locked BOOLEAN;
  locked_time TIMESTAMPTZ;
BEGIN
  -- Get total questions
  SELECT COUNT(*) INTO total_count
  FROM daily_trivia_questions
  WHERE question_number IS NOT NULL;
  
  -- Get answered count (correct answers only)
  SELECT COUNT(*) INTO answered_count
  FROM daily_trivia_answers dta
  JOIN daily_trivia_questions dtq ON dta.question_id = dtq.id
  WHERE dta.user_id = p_user_id
    AND dta.is_correct = true;
  
  -- Get correct count
  SELECT COUNT(*) INTO correct_count
  FROM daily_trivia_answers dta
  JOIN daily_trivia_questions dtq ON dta.question_id = dtq.id
  WHERE dta.user_id = p_user_id
    AND dta.is_correct = true;
  
  -- Check lockout status
  SELECT trivia_locked_until INTO locked_time
  FROM users
  WHERE id = p_user_id;
  
  -- Determine if locked
  IF locked_time IS NULL THEN
    locked := FALSE;
  ELSIF locked_time > NOW() THEN
    locked := TRUE;
  ELSE
    -- Lockout expired, clear it
    UPDATE users SET trivia_locked_until = NULL WHERE id = p_user_id;
    locked := FALSE;
    locked_time := NULL;
  END IF;
  
  RETURN QUERY
  SELECT 
    total_count,
    answered_count,
    correct_count,
    locked,
    locked_time,
    (answered_count >= total_count)::BOOLEAN as is_complete;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_user_trivia_locked IS 'Check if user is locked out from trivia (got wrong answer within 24h)';
COMMENT ON FUNCTION get_next_trivia_question IS 'Get the next unanswered question for a user';
COMMENT ON FUNCTION get_trivia_progress IS 'Get user progress through all 24 trivia questions';
