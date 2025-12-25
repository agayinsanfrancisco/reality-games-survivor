-- ============================================
-- LEAGUE CHAT FEATURE
-- ============================================

-- Create league messages table
CREATE TABLE league_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient message retrieval
CREATE INDEX idx_league_messages_league ON league_messages(league_id, created_at DESC);
CREATE INDEX idx_league_messages_user ON league_messages(user_id);

-- Enable RLS
ALTER TABLE league_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Members can read messages in their leagues
CREATE POLICY league_messages_select ON league_messages
  FOR SELECT
  USING (is_league_member(league_id));

-- Members can insert messages in their leagues
CREATE POLICY league_messages_insert ON league_messages
  FOR INSERT
  WITH CHECK (user_id = auth.uid() AND is_league_member(league_id));

-- Users can delete their own messages
CREATE POLICY league_messages_delete ON league_messages
  FOR DELETE
  USING (user_id = auth.uid());

-- Admin full access
CREATE POLICY league_messages_admin ON league_messages
  FOR ALL
  USING (is_admin());

-- Service role bypass
CREATE POLICY service_bypass_league_messages ON league_messages
  FOR ALL
  USING (auth.role() = 'service_role');

-- Enable realtime for league messages
ALTER publication supabase_realtime ADD TABLE league_messages;
