-- Content Management System for Email Templates and Site Copy
-- This allows admins to edit email templates and site copy from the admin panel

-- ============================================
-- EMAIL TEMPLATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template identification
  slug VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'welcome', 'pick-reminder', 'pre-season-hype'
  name VARCHAR(255) NOT NULL, -- Human-readable name
  description TEXT, -- What this email is for
  category VARCHAR(50) NOT NULL DEFAULT 'transactional', -- transactional, marketing, lifecycle
  
  -- Email content
  subject VARCHAR(500) NOT NULL,
  html_body TEXT NOT NULL, -- HTML template with {{variable}} placeholders
  text_body TEXT, -- Plain text version (optional)
  
  -- Template variables (JSON array of available variables)
  -- e.g., ["displayName", "leagueName", "daysRemaining"]
  available_variables JSONB DEFAULT '[]'::jsonb,
  
  -- Scheduling (for lifecycle emails)
  trigger_type VARCHAR(50), -- 'immediate', 'scheduled', 'event'
  trigger_config JSONB DEFAULT '{}'::jsonb, -- Schedule or event configuration
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false, -- System emails can't be deleted, only edited
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  -- Version tracking
  version INTEGER DEFAULT 1
);

-- Create index for quick lookups
CREATE INDEX idx_email_templates_slug ON email_templates(slug);
CREATE INDEX idx_email_templates_category ON email_templates(category);
CREATE INDEX idx_email_templates_active ON email_templates(is_active);

-- ============================================
-- EMAIL TEMPLATE VERSIONS (History)
-- ============================================

CREATE TABLE IF NOT EXISTS email_template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES email_templates(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  
  -- Snapshot of the template at this version
  subject VARCHAR(500) NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  
  -- Who made the change
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT now(),
  change_note TEXT,
  
  UNIQUE(template_id, version)
);

CREATE INDEX idx_email_template_versions_template ON email_template_versions(template_id);

-- ============================================
-- SITE COPY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS site_copy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content identification
  key VARCHAR(200) UNIQUE NOT NULL, -- e.g., 'home.hero.title', 'onboarding.step1.description'
  page VARCHAR(100) NOT NULL, -- e.g., 'home', 'dashboard', 'how-to-play'
  section VARCHAR(100), -- e.g., 'hero', 'features', 'faq'
  
  -- Content
  content_type VARCHAR(20) DEFAULT 'text', -- text, html, markdown
  content TEXT NOT NULL,
  
  -- Metadata
  description TEXT, -- What this copy is for (admin reference)
  max_length INTEGER, -- Optional character limit
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_site_copy_key ON site_copy(key);
CREATE INDEX idx_site_copy_page ON site_copy(page);
CREATE INDEX idx_site_copy_page_section ON site_copy(page, section);

-- ============================================
-- SITE COPY VERSIONS (History)
-- ============================================

CREATE TABLE IF NOT EXISTS site_copy_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_id UUID NOT NULL REFERENCES site_copy(id) ON DELETE CASCADE,
  
  -- Snapshot
  content TEXT NOT NULL,
  
  -- Who made the change
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT now(),
  
  version INTEGER NOT NULL
);

CREATE INDEX idx_site_copy_versions_copy ON site_copy_versions(copy_id);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_copy ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_copy_versions ENABLE ROW LEVEL SECURITY;

-- Email templates: Admin only for write, service role for read
CREATE POLICY "Admins can manage email templates"
  ON email_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

CREATE POLICY "Service role can read email templates"
  ON email_templates FOR SELECT
  TO service_role
  USING (true);

-- Email template versions: Admin only
CREATE POLICY "Admins can view email template versions"
  ON email_template_versions FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- Site copy: Admin for write, everyone for read (public content)
CREATE POLICY "Anyone can read active site copy"
  ON site_copy FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Admins can manage site copy"
  ON site_copy FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- Site copy versions: Admin only
CREATE POLICY "Admins can view site copy versions"
  ON site_copy_versions FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER site_copy_updated_at
  BEFORE UPDATE ON site_copy
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Save template version before update
-- ============================================

CREATE OR REPLACE FUNCTION save_email_template_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only save version if content changed
  IF OLD.subject != NEW.subject OR OLD.html_body != NEW.html_body OR OLD.text_body IS DISTINCT FROM NEW.text_body THEN
    INSERT INTO email_template_versions (template_id, version, subject, html_body, text_body, changed_by)
    VALUES (OLD.id, OLD.version, OLD.subject, OLD.html_body, OLD.text_body, NEW.updated_by);
    
    NEW.version := OLD.version + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER email_template_version_trigger
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION save_email_template_version();

-- ============================================
-- FUNCTION: Save site copy version before update
-- ============================================

CREATE OR REPLACE FUNCTION save_site_copy_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  -- Only save version if content changed
  IF OLD.content != NEW.content THEN
    SELECT COALESCE(MAX(version), 0) + 1 INTO next_version
    FROM site_copy_versions
    WHERE copy_id = OLD.id;
    
    INSERT INTO site_copy_versions (copy_id, content, changed_by, version)
    VALUES (OLD.id, OLD.content, NEW.updated_by, next_version);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER site_copy_version_trigger
  BEFORE UPDATE ON site_copy
  FOR EACH ROW
  EXECUTE FUNCTION save_site_copy_version();

-- ============================================
-- SEED: Default Email Templates
-- ============================================

INSERT INTO email_templates (slug, name, description, category, subject, html_body, available_variables, trigger_type, is_system) VALUES

-- Welcome Email
('welcome', 'Welcome Email', 'Sent when a new user signs up', 'transactional', 
'Welcome to Reality Games: Survivor',
'<h1>Welcome to the Island, {{displayName}}</h1>
<p>You''ve just taken your first step into the world of Reality Games Fantasy League - Survivor Edition!</p>
<p>Here''s what to do next:</p>
<ul>
<li><strong>Join a League</strong> - Create one with friends or join a public league</li>
<li><strong>Rank Castaways</strong> - Pick your favorites before the draft deadline</li>
<li><strong>Make Weekly Picks</strong> - Choose who to play each episode</li>
</ul>
<p><a href="{{dashboardUrl}}" style="background:#A52A2A;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;">Get Started</a></p>
<p><em>Outwit. Outplay. Outlast.</em></p>',
'["displayName", "dashboardUrl"]'::jsonb,
'immediate', true),

-- Pick Reminder
('pick-reminder', 'Pick Reminder', 'Sent before pick deadline', 'transactional',
'{{hoursRemaining}} hours to make your Episode {{episodeNumber}} pick',
'<h1>Time is Running Out</h1>
<p>Hey {{displayName}},</p>
<p>You have <strong>{{hoursRemaining}} hours</strong> to make your pick for Episode {{episodeNumber}}.</p>
<p>Don''t let auto-pick decide for you!</p>
<p><a href="{{dashboardUrl}}" style="background:#A52A2A;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;">Make Your Pick</a></p>',
'["displayName", "hoursRemaining", "episodeNumber", "dashboardUrl"]'::jsonb,
'scheduled', true),

-- Pre-Season Hype
('pre-season-hype', 'Pre-Season Countdown', 'Countdown emails before season premiere', 'lifecycle',
'{{daysUntilPremiere}} days until Season {{seasonNumber}} premieres',
'<h1>{{daysUntilPremiere}} Days Until the Premiere</h1>
<p>Hey {{displayName}},</p>
<p>{{seasonName}} kicks off in just {{daysUntilPremiere}} days! Are you ready?</p>
<div style="text-align:center;padding:20px;background:#FFF8F0;border-radius:12px;">
<div style="font-size:48px;font-weight:bold;color:#A52A2A;">{{daysUntilPremiere}}</div>
<div style="color:#8A7654;text-transform:uppercase;font-size:11px;">Days to Go</div>
</div>
<p><a href="{{dashboardUrl}}" style="background:#A52A2A;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;">Check Your Rankings</a></p>',
'["displayName", "seasonName", "seasonNumber", "daysUntilPremiere", "dashboardUrl"]'::jsonb,
'scheduled', true),

-- Join League Nudge
('join-league-nudge', 'Join League Reminder', 'Nudge for users who signed up but have not joined a league', 'lifecycle',
'Ready to play? Join a league before the season starts',
'<h1>Ready to Play?</h1>
<p>Hey {{displayName}},</p>
<p>You signed up {{daysSinceSignup}} days ago but haven''t joined a league yet. The fun is just getting started!</p>
<h2>Three Ways to Play</h2>
<ul>
<li><strong>Create a Private League</strong> - Invite friends and family</li>
<li><strong>Join a Public League</strong> - Match up with other fans</li>
<li><strong>Global Rankings</strong> - Already enrolled! Compete worldwide</li>
</ul>
<p><a href="{{browseLeaguesUrl}}" style="background:#A52A2A;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;">Find a League</a></p>',
'["displayName", "daysSinceSignup", "seasonName", "browseLeaguesUrl"]'::jsonb,
'scheduled', true),

-- Post-Season Wrap Up
('post-season-wrapup', 'Season Complete', 'End of season summary and thanks', 'lifecycle',
'Season complete - thanks for playing {{seasonName}}',
'<h1>Season Complete - Thanks for Playing</h1>
<p>Hey {{displayName}},</p>
<p>{{seasonName}} has come to an end. {{winnerName}} took home the title of Sole Survivor!</p>
<div style="text-align:center;padding:20px;background:#FFF8F0;border-radius:12px;">
<h2>Your Season Stats</h2>
<div style="display:inline-block;margin:10px;text-align:center;">
<div style="font-size:32px;font-weight:bold;color:#D4AF37;">{{totalPoints}}</div>
<div style="font-size:12px;color:#8A7654;">Total Points</div>
</div>
<div style="display:inline-block;margin:10px;text-align:center;">
<div style="font-size:32px;font-weight:bold;color:#A52A2A;">#{{bestRank}}</div>
<div style="font-size:12px;color:#8A7654;">Best Rank</div>
</div>
</div>
<p>Thanks for being part of Reality Games Fantasy League this season!</p>
<p><a href="{{triviaUrl}}" style="background:#A52A2A;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;">Play Trivia</a></p>',
'["displayName", "seasonName", "winnerName", "totalPoints", "bestRank", "leaguesPlayed", "triviaUrl"]'::jsonb,
'event', true),

-- Inactivity Reminder
('inactivity-reminder', 'We Miss You', 'Re-engagement for inactive users', 'lifecycle',
'We miss you - your fantasy team needs you',
'<h1>We Miss You</h1>
<p>Hey {{displayName}},</p>
<p>It''s been {{daysSinceLastActivity}} days since we last saw you. The game is still going and your team needs you!</p>
{{#if missedEpisodes}}
<div style="text-align:center;padding:20px;background:#FEF2F2;border-radius:12px;">
<div style="font-size:36px;font-weight:bold;color:#DC2626;">{{missedEpisodes}}</div>
<div style="font-size:12px;color:#991B1B;">Episodes Missed</div>
</div>
{{/if}}
<p><a href="{{dashboardUrl}}" style="background:#A52A2A;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;">Get Back in the Game</a></p>',
'["displayName", "daysSinceLastActivity", "missedEpisodes", "dashboardUrl"]'::jsonb,
'scheduled', true),

-- Private League Welcome
('private-league-welcome', 'Private League Welcome', 'Welcome when joining a non-global league', 'transactional',
'Welcome to {{leagueName}}',
'<h1>Welcome to {{leagueName}}</h1>
<p>Hey {{displayName}},</p>
<p>You''ve joined a private league created by {{commissionerName}} for {{seasonName}}. This is going to be fun!</p>
<div style="text-align:center;padding:20px;background:#FFF8F0;border-radius:12px;">
<div style="font-size:48px;font-weight:bold;color:#A52A2A;">{{memberCount}}<span style="font-size:24px;color:#8A7654;">/{{maxMembers}}</span></div>
<div style="font-size:12px;color:#8A7654;">Players Joined</div>
</div>
<h2>What to Do Now</h2>
<ol>
<li><strong>Complete your draft rankings</strong> - Rank all 24 castaways</li>
<li><strong>Invite others</strong> - Share the league with friends</li>
<li><strong>Trash talk</strong> - Head to the league chat</li>
</ol>
<p><a href="{{leagueUrl}}" style="background:#A52A2A;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;">View League</a></p>',
'["displayName", "leagueName", "commissionerName", "seasonName", "memberCount", "maxMembers", "leagueUrl"]'::jsonb,
'event', true),

-- Trivia Progress
('trivia-progress', 'Trivia Progress', 'Encouragement email for trivia players', 'lifecycle',
'Keep going - you''re doing great',
'<h1>Keep Going - You''re Doing Great</h1>
<p>Hey {{displayName}},</p>
<p>You''ve been crushing our Survivor trivia! Here''s how you''re doing:</p>
<div style="text-align:center;padding:20px;">
<div style="display:inline-block;margin:10px;text-align:center;">
<div style="font-size:32px;font-weight:bold;color:#A52A2A;">{{percentComplete}}%</div>
<div style="font-size:12px;color:#8A7654;">Complete</div>
</div>
<div style="display:inline-block;margin:10px;text-align:center;">
<div style="font-size:32px;font-weight:bold;color:#16A34A;">{{accuracy}}%</div>
<div style="font-size:12px;color:#8A7654;">Accuracy</div>
</div>
</div>
<p>Complete all questions correctly to earn your spot on the leaderboard!</p>
<p><a href="{{triviaUrl}}" style="background:#A52A2A;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;">Continue Trivia</a></p>',
'["displayName", "percentComplete", "accuracy", "questionsCorrect", "totalQuestions", "triviaUrl"]'::jsonb,
'scheduled', true),

-- Episode Results (Spoiler-Safe)
('episode-results', 'Episode Results', 'Spoiler-safe notification that results are ready', 'transactional',
'Episode {{episodeNumber}} results are ready',
'<h1>Episode {{episodeNumber}} Results Are Ready</h1>
<p>Hey {{displayName}},</p>
<p>The latest episode has been scored and your results are ready to view.</p>
<div style="text-align:center;padding:20px;background:#FFFBEB;border-radius:12px;border:1px solid #F59E0B;">
<p style="color:#92400E;font-weight:bold;margin:0 0 12px 0;">Spoiler Warning</p>
<p style="color:#A16207;font-size:14px;margin:0 0 16px 0;">Click the button below to reveal your scores and standings.</p>
<a href="{{dashboardUrl}}" style="background:#A52A2A;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;">View My Results</a>
</div>
<p style="color:#8A7654;font-style:italic;">The tribe has spoken.</p>',
'["displayName", "episodeNumber", "dashboardUrl"]'::jsonb,
'event', true)

ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED: Default Site Copy
-- ============================================

INSERT INTO site_copy (key, page, section, content_type, content, description) VALUES

-- Home Page
('home.hero.title', 'home', 'hero', 'text', 'Fantasy Survivor', 'Main hero title'),
('home.hero.subtitle', 'home', 'hero', 'text', 'Draft your team. Make your picks. Outwit, outplay, outlast.', 'Hero subtitle'),
('home.hero.cta', 'home', 'hero', 'text', 'Join Season 50', 'Main call-to-action button'),

('home.features.scoring.title', 'home', 'features', 'text', '100+ Scoring Rules', 'Scoring feature title'),
('home.features.scoring.description', 'home', 'features', 'text', 'Every strategic move, challenge win, and tribal council moment earns points.', 'Scoring feature description'),

('home.features.drafts.title', 'home', 'features', 'text', 'Snake Draft System', 'Drafts feature title'),
('home.features.drafts.description', 'home', 'features', 'text', 'Rank your favorite castaways and our algorithm drafts your team.', 'Drafts feature description'),

('home.features.leagues.title', 'home', 'features', 'text', 'Public & Private Leagues', 'Leagues feature title'),
('home.features.leagues.description', 'home', 'features', 'text', 'Compete with friends or join the global leaderboard.', 'Leagues feature description'),

-- How to Play Page
('howtoplay.intro', 'how-to-play', 'intro', 'text', 'Reality Games Fantasy League brings the strategy of Survivor to you. Draft castaways, make weekly picks, and score points based on what happens each episode.', 'Intro paragraph'),

('howtoplay.step1.title', 'how-to-play', 'steps', 'text', 'Join a League', 'Step 1 title'),
('howtoplay.step1.description', 'how-to-play', 'steps', 'text', 'Create a private league with friends or join a public league to compete with other fans.', 'Step 1 description'),

('howtoplay.step2.title', 'how-to-play', 'steps', 'text', 'Rank Castaways', 'Step 2 title'),
('howtoplay.step2.description', 'how-to-play', 'steps', 'text', 'Before the season starts, rank all 24 castaways from your favorite to least favorite. This determines your draft order.', 'Step 2 description'),

('howtoplay.step3.title', 'how-to-play', 'steps', 'text', 'Make Weekly Picks', 'Step 3 title'),
('howtoplay.step3.description', 'how-to-play', 'steps', 'text', 'Each week, choose which of your castaways to play. Points only count for your active pick!', 'Step 3 description'),

-- Dashboard
('dashboard.welcome.title', 'dashboard', 'welcome', 'text', 'Welcome Back', 'Dashboard welcome title'),
('dashboard.noleague.message', 'dashboard', 'empty', 'text', 'You haven''t joined any leagues yet. Join one to start playing!', 'No league message'),
('dashboard.noleague.cta', 'dashboard', 'empty', 'text', 'Browse Leagues', 'No league CTA'),

-- Trivia
('trivia.intro', 'trivia', 'intro', 'text', 'Think you know Survivor? Prove it! Answer 24 questions correctly to join the leaderboard.', 'Trivia intro'),
('trivia.rules', 'trivia', 'rules', 'text', 'You have 20 seconds per question. Get one wrong and you''re locked out for 24 hours.', 'Trivia rules'),

-- Footer
('footer.tagline', 'global', 'footer', 'text', 'Outwit. Outplay. Outlast.', 'Footer tagline'),
('footer.copyright', 'global', 'footer', 'text', 'Reality Games Fantasy League is not affiliated with CBS or Survivor.', 'Copyright disclaimer')

ON CONFLICT (key) DO NOTHING;
