-- ============================================
-- DAILY TRIVIA TRACKING
-- Migration 029: Track daily trivia questions and answers
-- ============================================

-- Table to store daily trivia questions
CREATE TABLE IF NOT EXISTS daily_trivia_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_date DATE NOT NULL UNIQUE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_index INTEGER NOT NULL,
  fun_fact TEXT,
  castaway_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to track user answers
CREATE TABLE IF NOT EXISTS daily_trivia_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES daily_trivia_questions(id) ON DELETE CASCADE,
  selected_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id) -- One answer per user per question
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_trivia_questions_date ON daily_trivia_questions(question_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_trivia_answers_user_id ON daily_trivia_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_trivia_answers_question_id ON daily_trivia_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_daily_trivia_answers_user_date ON daily_trivia_answers(user_id, answered_at DESC);

-- Function to get user's trivia stats
CREATE OR REPLACE FUNCTION get_user_trivia_stats(p_user_id UUID)
RETURNS TABLE (
  total_answered INTEGER,
  total_correct INTEGER,
  current_streak INTEGER,
  longest_streak INTEGER,
  perfect_days INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH user_answers AS (
    SELECT 
      dta.answered_at::DATE as answer_date,
      dta.is_correct,
      ROW_NUMBER() OVER (PARTITION BY dta.answered_at::DATE ORDER BY dta.answered_at DESC) as rn
    FROM daily_trivia_answers dta
    WHERE dta.user_id = p_user_id
  ),
  daily_results AS (
    SELECT 
      answer_date,
      is_correct,
      LAG(is_correct) OVER (ORDER BY answer_date) as prev_correct
    FROM user_answers
    WHERE rn = 1
  ),
  streaks AS (
    SELECT 
      answer_date,
      is_correct,
      SUM(CASE WHEN is_correct = prev_correct OR prev_correct IS NULL THEN 0 ELSE 1 END) 
        OVER (ORDER BY answer_date) as streak_group
    FROM daily_results
    WHERE is_correct = true
  )
  SELECT 
    (SELECT COUNT(*) FROM user_answers WHERE rn = 1)::INTEGER as total_answered,
    (SELECT COUNT(*) FROM user_answers WHERE rn = 1 AND is_correct = true)::INTEGER as total_correct,
    COALESCE((
      SELECT COUNT(*)::INTEGER
      FROM streaks
      WHERE streak_group = (SELECT MAX(streak_group) FROM streaks)
    ), 0) as current_streak,
    COALESCE((
      SELECT MAX(streak_count)::INTEGER
      FROM (
        SELECT COUNT(*) as streak_count
        FROM streaks
        GROUP BY streak_group
      ) sub
    ), 0) as longest_streak,
    (SELECT COUNT(*)::INTEGER FROM user_answers WHERE rn = 1 AND is_correct = true)::INTEGER as perfect_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE daily_trivia_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_trivia_answers ENABLE ROW LEVEL SECURITY;

-- Users can read all questions
CREATE POLICY "Anyone can read trivia questions"
  ON daily_trivia_questions FOR SELECT
  USING (true);

-- Users can only insert their own answers
CREATE POLICY "Users can insert their own answers"
  ON daily_trivia_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own answers
CREATE POLICY "Users can read their own answers"
  ON daily_trivia_answers FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can manage questions
CREATE POLICY "Admins can manage trivia questions"
  ON daily_trivia_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Leaderboard table
CREATE TABLE IF NOT EXISTS daily_trivia_leaderboard (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  days_to_complete INTEGER NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  rank INTEGER GENERATED ALWAYS AS (
    ROW_NUMBER() OVER (ORDER BY days_to_complete ASC, completed_at ASC)
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_trivia_leaderboard_days ON daily_trivia_leaderboard(days_to_complete ASC, completed_at ASC);

-- RLS for leaderboard
ALTER TABLE daily_trivia_leaderboard ENABLE ROW LEVEL SECURITY;

-- Anyone can read leaderboard
CREATE POLICY "Anyone can read leaderboard"
  ON daily_trivia_leaderboard FOR SELECT
  USING (true);

COMMENT ON TABLE daily_trivia_questions IS 'Daily trivia questions - one per day';
COMMENT ON TABLE daily_trivia_answers IS 'User answers to daily trivia questions';
COMMENT ON TABLE daily_trivia_leaderboard IS 'Leaderboard tracking days to complete all trivia questions';
COMMENT ON FUNCTION get_user_trivia_stats IS 'Get comprehensive trivia statistics for a user';
