-- Enable pg_cron extension (must be done by superuser, already enabled on Supabase)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a table to log cron job executions
CREATE TABLE IF NOT EXISTS cron_job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  success BOOLEAN DEFAULT FALSE,
  result JSONB,
  error TEXT
);

CREATE INDEX idx_cron_job_logs_name ON cron_job_logs(job_name);
CREATE INDEX idx_cron_job_logs_started ON cron_job_logs(started_at DESC);

-- Function to call Edge Functions via pg_net
-- Note: pg_net must be enabled in Supabase dashboard first
CREATE OR REPLACE FUNCTION call_edge_function(
  function_name TEXT,
  request_path TEXT DEFAULT '',
  request_body JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url TEXT := 'https://qxrgejdfxcvsfktgysop.supabase.co';
  service_role_key TEXT;
  request_id BIGINT;
BEGIN
  -- Get the service role key from vault (or use env var)
  -- For security, store this in vault: SELECT vault.create_secret('service_role_key', 'your-key');
  service_role_key := current_setting('app.service_role_key', true);

  -- If not set, skip (for local development)
  IF service_role_key IS NULL THEN
    RAISE NOTICE 'Service role key not configured, skipping edge function call';
    RETURN;
  END IF;

  -- Make HTTP request to edge function
  SELECT net.http_post(
    url := supabase_url || '/functions/v1/' || function_name || request_path,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := request_body
  ) INTO request_id;

  RAISE NOTICE 'Edge function % called with request_id %', function_name, request_id;
END;
$$;

-- Weekly pick locking job - Wednesdays at 3:00 PM PST (11:00 PM UTC)
-- SELECT cron.schedule(
--   'lock-weekly-picks',
--   '0 23 * * 3',  -- Every Wednesday at 11:00 PM UTC (3:00 PM PST)
--   $$SELECT call_edge_function('picks', '/lock')$$
-- );

-- Auto-fill missing picks - Wednesdays at 3:05 PM PST (11:05 PM UTC)
-- SELECT cron.schedule(
--   'auto-fill-picks',
--   '5 23 * * 3',  -- Every Wednesday at 11:05 PM UTC (3:05 PM PST)
--   $$SELECT call_edge_function('picks', '/auto-fill')$$
-- );

-- Process waivers - Wednesdays at 2:55 PM PST (10:55 PM UTC)
-- SELECT cron.schedule(
--   'process-waivers',
--   '55 22 * * 3',  -- Every Wednesday at 10:55 PM UTC (2:55 PM PST)
--   $$SELECT call_edge_function('waivers', '/process')$$
-- );

-- Pick reminders - Wednesdays at 12:00 PM PST (8:00 PM UTC)
-- SELECT cron.schedule(
--   'send-pick-reminders',
--   '0 20 * * 3',  -- Every Wednesday at 8:00 PM UTC (12:00 PM PST)
--   $$SELECT call_edge_function('notifications', '/send-reminders', '{"type": "pick"}'::jsonb)$$
-- );

-- Waiver reminders - Tuesdays at 12:00 PM PST (8:00 PM UTC)
-- SELECT cron.schedule(
--   'send-waiver-reminders',
--   '0 20 * * 2',  -- Every Tuesday at 8:00 PM UTC (12:00 PM PST)
--   $$SELECT call_edge_function('notifications', '/send-reminders', '{"type": "waiver"}'::jsonb)$$
-- );

-- Weekly summary - Sundays at 10:00 AM PST (6:00 PM UTC)
-- SELECT cron.schedule(
--   'weekly-summary',
--   '0 18 * * 0',  -- Every Sunday at 6:00 PM UTC (10:00 AM PST)
--   $$SELECT call_edge_function('notifications', '/weekly-summary')$$
-- );

-- Draft finalize - One-time on March 2, 2026 at 8:00 PM PST
-- This needs to be scheduled manually closer to the date or use a at() function
-- SELECT cron.schedule(
--   'finalize-drafts',
--   '0 4 3 3 *',  -- March 3 at 4:00 AM UTC (March 2 at 8:00 PM PST)
--   $$SELECT call_edge_function('draft', '/finalize-all')$$
-- );

-- Note: To enable these jobs, uncomment the SELECT statements above
-- and run this migration. Jobs can be managed via:
--   SELECT * FROM cron.job;  -- View all jobs
--   SELECT cron.unschedule('job-name');  -- Remove a job
--   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;  -- View job history
