-- Email Queue System
-- Ensures critical emails are delivered with retry logic and dead letter queue

-- Email queue table for retry mechanism
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('critical', 'normal')),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  text TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);

-- Index for efficient polling of pending emails
CREATE INDEX IF NOT EXISTS idx_email_queue_next_retry
ON email_queue(next_retry_at)
WHERE sent_at IS NULL AND failed_at IS NULL;

-- Index for finding emails by recipient
CREATE INDEX IF NOT EXISTS idx_email_queue_to_email
ON email_queue(to_email);

-- Index for finding emails by type and status
CREATE INDEX IF NOT EXISTS idx_email_queue_type_status
ON email_queue(type, created_at DESC)
WHERE sent_at IS NULL AND failed_at IS NULL;

-- Failed emails table (dead letter queue)
CREATE TABLE IF NOT EXISTS failed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_job JSONB NOT NULL,
  failed_at TIMESTAMPTZ DEFAULT NOW(),
  retry_attempted BOOLEAN DEFAULT false,
  retry_succeeded BOOLEAN DEFAULT false,
  retry_at TIMESTAMPTZ,
  notes TEXT
);

-- Index for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_failed_emails_failed_at
ON failed_emails(failed_at DESC);

-- Index for retry tracking
CREATE INDEX IF NOT EXISTS idx_failed_emails_retry
ON failed_emails(retry_attempted, retry_succeeded)
WHERE retry_attempted = true;
