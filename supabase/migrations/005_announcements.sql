-- ============================================
-- 005: ANNOUNCEMENTS
-- Admin-controlled announcements displayed on dashboard
-- ============================================

-- Create announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, warning, success, urgent
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active announcements query
CREATE INDEX idx_announcements_active ON announcements(is_active, starts_at, expires_at);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Everyone can read active announcements
CREATE POLICY announcements_select_active ON announcements
  FOR SELECT USING (
    is_active = true
    AND starts_at <= NOW()
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Admins can do everything
CREATE POLICY announcements_admin ON announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Service role bypass
CREATE POLICY service_bypass_announcements ON announcements
  FOR ALL USING (auth.role() = 'service_role');

-- Auto-update updated_at
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
