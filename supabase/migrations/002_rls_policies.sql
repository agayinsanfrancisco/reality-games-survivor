-- ============================================
-- ROW-LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE castaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiver_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiver_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_commissioner(league_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM leagues WHERE id = league_uuid AND commissioner_id = auth.uid())
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_league_member(league_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM league_members WHERE league_id = league_uuid AND user_id = auth.uid())
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- USERS policies
CREATE POLICY users_select_own ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY users_update_own ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY users_select_admin ON users FOR SELECT USING (is_admin());
CREATE POLICY users_update_admin ON users FOR UPDATE USING (is_admin());
CREATE POLICY users_select_league_mates ON users FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM league_members lm1
    JOIN league_members lm2 ON lm1.league_id = lm2.league_id
    WHERE lm1.user_id = auth.uid() AND lm2.user_id = users.id
  )
);

-- PUBLIC READ tables
CREATE POLICY seasons_select_all ON seasons FOR SELECT USING (true);
CREATE POLICY seasons_admin ON seasons FOR ALL USING (is_admin());

CREATE POLICY episodes_select_all ON episodes FOR SELECT USING (true);
CREATE POLICY episodes_admin ON episodes FOR ALL USING (is_admin());

CREATE POLICY castaways_select_all ON castaways FOR SELECT USING (true);
CREATE POLICY castaways_admin ON castaways FOR ALL USING (is_admin());

CREATE POLICY scoring_rules_select_all ON scoring_rules FOR SELECT USING (true);
CREATE POLICY scoring_rules_admin ON scoring_rules FOR ALL USING (is_admin());

-- LEAGUES policies
CREATE POLICY leagues_select_public ON leagues FOR SELECT USING (is_public = true);
CREATE POLICY leagues_select_member ON leagues FOR SELECT USING (is_league_member(id));
CREATE POLICY leagues_select_commissioner ON leagues FOR SELECT USING (commissioner_id = auth.uid());
CREATE POLICY leagues_insert ON leagues FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND commissioner_id = auth.uid());
CREATE POLICY leagues_update_commissioner ON leagues FOR UPDATE USING (commissioner_id = auth.uid());
CREATE POLICY leagues_delete_commissioner ON leagues FOR DELETE USING (commissioner_id = auth.uid() AND draft_status = 'pending');
CREATE POLICY leagues_admin ON leagues FOR ALL USING (is_admin());

-- LEAGUE_MEMBERS policies
CREATE POLICY league_members_select_member ON league_members FOR SELECT USING (is_league_member(league_id));
CREATE POLICY league_members_select_public ON league_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM leagues WHERE id = league_id AND is_public = true)
);
CREATE POLICY league_members_insert_self ON league_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY league_members_delete_self ON league_members FOR DELETE USING (user_id = auth.uid());
CREATE POLICY league_members_admin ON league_members FOR ALL USING (is_admin());

-- ROSTERS policies
CREATE POLICY rosters_select_member ON rosters FOR SELECT USING (is_league_member(league_id));
CREATE POLICY rosters_select_public ON rosters FOR SELECT USING (
  EXISTS (SELECT 1 FROM leagues WHERE id = league_id AND is_public = true)
);
CREATE POLICY rosters_insert_own ON rosters FOR INSERT WITH CHECK (user_id = auth.uid() AND is_league_member(league_id));
CREATE POLICY rosters_update_own ON rosters FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY rosters_admin ON rosters FOR ALL USING (is_admin());

-- WEEKLY_PICKS policies
CREATE POLICY weekly_picks_select_own ON weekly_picks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY weekly_picks_select_locked ON weekly_picks FOR SELECT USING (
  is_league_member(league_id) AND status IN ('locked', 'auto_picked')
);
CREATE POLICY weekly_picks_select_public ON weekly_picks FOR SELECT USING (
  EXISTS (SELECT 1 FROM leagues WHERE id = league_id AND is_public = true)
  AND status IN ('locked', 'auto_picked')
);
CREATE POLICY weekly_picks_insert_own ON weekly_picks FOR INSERT WITH CHECK (user_id = auth.uid() AND is_league_member(league_id));
CREATE POLICY weekly_picks_update_own ON weekly_picks FOR UPDATE USING (user_id = auth.uid() AND status = 'pending');
CREATE POLICY weekly_picks_admin ON weekly_picks FOR ALL USING (is_admin());

-- WAIVER_RANKINGS policies
CREATE POLICY waiver_rankings_select_own ON waiver_rankings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY waiver_rankings_select_commissioner ON waiver_rankings FOR SELECT USING (is_commissioner(league_id));
CREATE POLICY waiver_rankings_insert_own ON waiver_rankings FOR INSERT WITH CHECK (user_id = auth.uid() AND is_league_member(league_id));
CREATE POLICY waiver_rankings_update_own ON waiver_rankings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY waiver_rankings_delete_own ON waiver_rankings FOR DELETE USING (user_id = auth.uid());
CREATE POLICY waiver_rankings_admin ON waiver_rankings FOR ALL USING (is_admin());

-- WAIVER_RESULTS policies
CREATE POLICY waiver_results_select_member ON waiver_results FOR SELECT USING (is_league_member(league_id));
CREATE POLICY waiver_results_select_public ON waiver_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM leagues WHERE id = league_id AND is_public = true)
);
CREATE POLICY waiver_results_admin ON waiver_results FOR ALL USING (is_admin());

-- EPISODE_SCORES policies
CREATE POLICY episode_scores_select_finalized ON episode_scores FOR SELECT USING (
  EXISTS (SELECT 1 FROM scoring_sessions WHERE episode_id = episode_scores.episode_id AND status = 'finalized')
);
CREATE POLICY episode_scores_admin ON episode_scores FOR ALL USING (is_admin());

-- SCORING_SESSIONS policies
CREATE POLICY scoring_sessions_select_finalized ON scoring_sessions FOR SELECT USING (status = 'finalized');
CREATE POLICY scoring_sessions_admin ON scoring_sessions FOR ALL USING (is_admin());

-- NOTIFICATIONS policies
CREATE POLICY notifications_select_own ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY notifications_update_own ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY notifications_admin ON notifications FOR ALL USING (is_admin());

-- SMS_COMMANDS policies
CREATE POLICY sms_commands_select_own ON sms_commands FOR SELECT USING (user_id = auth.uid());
CREATE POLICY sms_commands_admin ON sms_commands FOR ALL USING (is_admin());

-- PAYMENTS policies
CREATE POLICY payments_select_own ON payments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY payments_admin ON payments FOR ALL USING (is_admin());

-- SERVICE ROLE BYPASS (for backend operations)
CREATE POLICY service_bypass_users ON users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_bypass_league_members ON league_members FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_bypass_rosters ON rosters FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_bypass_weekly_picks ON weekly_picks FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_bypass_waiver_rankings ON waiver_rankings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_bypass_waiver_results ON waiver_results FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_bypass_episode_scores ON episode_scores FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_bypass_scoring_sessions ON scoring_sessions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_bypass_notifications ON notifications FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_bypass_sms_commands ON sms_commands FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_bypass_payments ON payments FOR ALL USING (auth.role() = 'service_role');
