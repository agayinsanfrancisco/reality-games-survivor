-- ============================================================================
-- NONPROFIT FUND TRACKING MIGRATION
-- ============================================================================
-- Purpose: Track fund splits (7% operational, 93% restricted) per league
-- Compliance: FASB 958 nonprofit accounting standards
-- Author: Reality Games Fantasy League
-- Date: 2026-01-04
-- ============================================================================

-- Step 1: Add fund split tracking to payments table
-- ============================================================================
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS processing_fee NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS operational_fund NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS restricted_fund NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_receipt_sent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tax_receipt_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tax_receipt_url TEXT;

-- Add indexes for fund tracking queries
CREATE INDEX IF NOT EXISTS idx_payments_tax_receipt_pending
  ON payments(user_id, created_at)
  WHERE tax_receipt_sent = FALSE AND status = 'completed';

CREATE INDEX IF NOT EXISTS idx_payments_league_status
  ON payments(league_id, status);

-- Step 2: Add charity selection tracking to leagues table
-- ============================================================================
ALTER TABLE leagues
  ADD COLUMN IF NOT EXISTS charity_name TEXT,
  ADD COLUMN IF NOT EXISTS charity_ein TEXT,
  ADD COLUMN IF NOT EXISTS charity_address TEXT,
  ADD COLUMN IF NOT EXISTS charity_selected_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS charity_selected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS funds_disbursed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS disbursement_notes TEXT;

-- Index for tracking which leagues need charity selection/disbursement
CREATE INDEX IF NOT EXISTS idx_leagues_charity_pending
  ON leagues(status, charity_selected_at)
  WHERE status = 'completed' AND charity_selected_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_leagues_disbursement_pending
  ON leagues(charity_selected_at, funds_disbursed_at)
  WHERE charity_selected_at IS NOT NULL AND funds_disbursed_at IS NULL;

-- Step 3: Create charity disbursements tracking table
-- ============================================================================
CREATE TABLE IF NOT EXISTS charity_disbursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE RESTRICT,
  charity_name TEXT NOT NULL,
  charity_ein TEXT,
  charity_address TEXT,
  total_amount NUMERIC(10,2) NOT NULL,
  payment_count INTEGER NOT NULL,
  payment_ids UUID[] NOT NULL,
  disbursement_method TEXT NOT NULL DEFAULT 'check', -- check, ach, wire, other
  bank_transaction_ref TEXT,
  check_number TEXT,
  disbursed_by UUID NOT NULL REFERENCES users(id),
  disbursed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for charity disbursement tracking
CREATE INDEX idx_charity_disbursements_league ON charity_disbursements(league_id);
CREATE INDEX idx_charity_disbursements_date ON charity_disbursements(disbursed_at DESC);
CREATE INDEX idx_charity_disbursements_charity ON charity_disbursements(charity_name);

-- Step 4: Add comments for documentation
-- ============================================================================
COMMENT ON COLUMN payments.processing_fee IS 'Stripe processing fee (2.2% + $0.30 for nonprofits)';
COMMENT ON COLUMN payments.operational_fund IS '7% of net donation for platform operations (unrestricted fund)';
COMMENT ON COLUMN payments.restricted_fund IS '93% of net donation for winner''s chosen charity (restricted fund)';
COMMENT ON COLUMN payments.tax_receipt_sent IS 'Whether IRS-compliant donation receipt has been sent';

COMMENT ON COLUMN leagues.charity_name IS 'Charity chosen by league winner for fund disbursement';
COMMENT ON COLUMN leagues.charity_ein IS 'Tax ID of chosen charity for verification';
COMMENT ON COLUMN leagues.charity_selected_by IS 'League winner who selected the charity';

COMMENT ON TABLE charity_disbursements IS 'Tracks disbursements to charities from restricted funds';

-- Step 5: Create fund calculation views
-- ============================================================================

-- View: League fund balances (per league aggregation)
CREATE OR REPLACE VIEW league_fund_balances AS
SELECT
  l.id AS league_id,
  l.name AS league_name,
  l.status AS league_status,
  l.charity_name,
  l.charity_selected_at,
  l.funds_disbursed_at,
  COUNT(p.id) AS payment_count,
  COALESCE(SUM(p.amount), 0) AS total_donations,
  COALESCE(SUM(p.processing_fee), 0) AS total_processing_fees,
  COALESCE(SUM(p.operational_fund), 0) AS total_operational_fund,
  COALESCE(SUM(p.restricted_fund), 0) AS total_restricted_fund,
  CASE
    WHEN l.funds_disbursed_at IS NOT NULL THEN 'disbursed'
    WHEN l.charity_selected_at IS NOT NULL THEN 'ready_to_disburse'
    WHEN l.status = 'completed' THEN 'awaiting_charity_selection'
    ELSE 'league_in_progress'
  END AS fund_status
FROM leagues l
LEFT JOIN payments p ON p.league_id = l.id AND p.status = 'completed'
WHERE l.require_donation = TRUE
GROUP BY l.id, l.name, l.status, l.charity_name, l.charity_selected_at, l.funds_disbursed_at;

COMMENT ON VIEW league_fund_balances IS 'Per-league aggregation of all fund balances for nonprofit tracking';

-- View: Global fund summary (across all leagues)
CREATE OR REPLACE VIEW global_fund_summary AS
SELECT
  COUNT(DISTINCT l.id) AS total_paid_leagues,
  COUNT(DISTINCT p.id) AS total_payments,
  COALESCE(SUM(p.amount), 0) AS total_donations_received,
  COALESCE(SUM(p.processing_fee), 0) AS total_processing_fees_paid,
  COALESCE(SUM(p.operational_fund), 0) AS total_operational_fund,
  COALESCE(SUM(p.restricted_fund), 0) AS total_restricted_fund,
  COALESCE(SUM(CASE WHEN l.funds_disbursed_at IS NOT NULL THEN p.restricted_fund ELSE 0 END), 0) AS total_disbursed_to_charity,
  COALESCE(SUM(CASE WHEN l.funds_disbursed_at IS NULL THEN p.restricted_fund ELSE 0 END), 0) AS total_restricted_fund_held,
  COUNT(DISTINCT CASE WHEN l.charity_selected_at IS NOT NULL AND l.funds_disbursed_at IS NULL THEN l.id END) AS leagues_pending_disbursement
FROM payments p
JOIN leagues l ON l.id = p.league_id
WHERE p.status = 'completed' AND l.require_donation = TRUE;

COMMENT ON VIEW global_fund_summary IS 'Organization-wide fund tracking for 501(c)(3) compliance and reporting';

-- View: Pending tax receipts
CREATE OR REPLACE VIEW pending_tax_receipts AS
SELECT
  p.id AS payment_id,
  p.user_id,
  p.league_id,
  p.amount,
  p.created_at AS donation_date,
  u.email,
  u.display_name,
  l.name AS league_name
FROM payments p
JOIN users u ON u.id = p.user_id
JOIN leagues l ON l.id = p.league_id
WHERE p.status = 'completed'
  AND p.tax_receipt_sent = FALSE
ORDER BY p.created_at DESC;

COMMENT ON VIEW pending_tax_receipts IS 'Donations requiring IRS-compliant tax receipts to be sent';

-- Step 6: Create updated payment processing function
-- ============================================================================

CREATE OR REPLACE FUNCTION process_league_payment_with_fund_split(
  p_user_id UUID,
  p_league_id UUID,
  p_total_amount NUMERIC,
  p_processing_fee NUMERIC,
  p_operational_fund NUMERIC,
  p_restricted_fund NUMERIC,
  p_currency TEXT,
  p_session_id TEXT,
  p_payment_intent_id TEXT
) RETURNS TABLE(membership_id UUID, payment_id UUID) AS $$
DECLARE
  v_membership_id UUID;
  v_payment_id UUID;
BEGIN
  -- Check if already a member (idempotency)
  SELECT id INTO v_membership_id
  FROM league_members
  WHERE league_id = p_league_id AND user_id = p_user_id;

  IF v_membership_id IS NULL THEN
    -- Add to league
    INSERT INTO league_members (league_id, user_id)
    VALUES (p_league_id, p_user_id)
    RETURNING id INTO v_membership_id;
  END IF;

  -- Record payment with fund split (will skip if duplicate session_id due to ON CONFLICT)
  INSERT INTO payments (
    user_id,
    league_id,
    amount,
    processing_fee,
    operational_fund,
    restricted_fund,
    currency,
    stripe_session_id,
    stripe_payment_intent_id,
    status
  )
  VALUES (
    p_user_id,
    p_league_id,
    p_total_amount,
    p_processing_fee,
    p_operational_fund,
    p_restricted_fund,
    p_currency,
    p_session_id,
    p_payment_intent_id,
    'completed'
  )
  ON CONFLICT (stripe_session_id) DO NOTHING
  RETURNING id INTO v_payment_id;

  RETURN QUERY SELECT v_membership_id, v_payment_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION process_league_payment_with_fund_split IS 'Atomically records payment and membership with 7%/93% fund split for nonprofit accounting';

-- Step 7: Grant necessary permissions
-- ============================================================================

-- Grant select on views to authenticated users (read-only)
GRANT SELECT ON league_fund_balances TO authenticated;
GRANT SELECT ON global_fund_summary TO authenticated;
GRANT SELECT ON pending_tax_receipts TO authenticated;

-- Grant full access to charity_disbursements for service role
GRANT ALL ON charity_disbursements TO service_role;
