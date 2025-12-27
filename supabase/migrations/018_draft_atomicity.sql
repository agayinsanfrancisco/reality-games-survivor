-- Draft Pick Atomicity
-- Prevents concurrent draft picks from corrupting snake draft order
-- Uses Postgres advisory locks to ensure only one pick at a time per league

-- Helper function to calculate snake draft picker index
CREATE OR REPLACE FUNCTION get_snake_picker_index(
  p_pick_number INTEGER,
  p_total_members INTEGER
) RETURNS TABLE(round INTEGER, picker_index INTEGER) AS $$
BEGIN
  round := (p_pick_number / p_total_members) + 1;
  picker_index := CASE
    WHEN round % 2 = 1 THEN p_pick_number % p_total_members
    ELSE p_total_members - 1 - (p_pick_number % p_total_members)
  END;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Atomic draft pick function with advisory lock
CREATE OR REPLACE FUNCTION submit_draft_pick(
  p_league_id UUID,
  p_user_id UUID,
  p_castaway_id UUID,
  p_idempotency_token TEXT DEFAULT NULL
) RETURNS TABLE(
  roster_id UUID,
  draft_round INTEGER,
  draft_pick INTEGER,
  is_draft_complete BOOLEAN,
  next_picker_user_id UUID,
  error_code TEXT,
  error_message TEXT
) AS $$
DECLARE
  v_league_lock_id BIGINT;
  v_draft_status TEXT;
  v_draft_order UUID[];
  v_total_members INTEGER;
  v_total_picks INTEGER;
  v_current_round INTEGER;
  v_current_picker_index INTEGER;
  v_current_picker_user_id UUID;
  v_user_pick_count INTEGER;
  v_castaway_already_picked BOOLEAN;
  v_next_picker_index INTEGER;
  v_roster_id UUID;
BEGIN
  -- Convert league_id to bigint for advisory lock (use hash)
  v_league_lock_id := ('x' || substring(md5(p_league_id::TEXT) from 1 for 15))::bit(60)::bigint;

  -- Acquire advisory lock (blocks until available, released at transaction end)
  PERFORM pg_advisory_xact_lock(v_league_lock_id);

  -- Check if this is a duplicate request (idempotency)
  IF p_idempotency_token IS NOT NULL THEN
    SELECT id INTO v_roster_id
    FROM rosters
    WHERE league_id = p_league_id
      AND user_id = p_user_id
      AND castaway_id = p_castaway_id
    LIMIT 1;

    IF v_roster_id IS NOT NULL THEN
      -- Pick already exists, return existing pick
      SELECT r.id, r.draft_round, r.draft_pick
      INTO roster_id, draft_round, draft_pick
      FROM rosters r
      WHERE r.id = v_roster_id;

      is_draft_complete := FALSE;
      next_picker_user_id := NULL;
      error_code := NULL;
      error_message := NULL;
      RETURN NEXT;
      RETURN;
    END IF;
  END IF;

  -- Get league draft status and order
  SELECT l.draft_status, l.draft_order
  INTO v_draft_status, v_draft_order
  FROM leagues l
  WHERE l.id = p_league_id;

  IF v_draft_status IS NULL THEN
    error_code := 'LEAGUE_NOT_FOUND';
    error_message := 'League not found';
    RETURN NEXT;
    RETURN;
  END IF;

  IF v_draft_status != 'in_progress' THEN
    error_code := 'DRAFT_NOT_IN_PROGRESS';
    error_message := 'Draft is not in progress';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Count members and existing picks
  SELECT COUNT(*) INTO v_total_members
  FROM league_members
  WHERE league_id = p_league_id;

  SELECT COUNT(*) INTO v_total_picks
  FROM rosters
  WHERE league_id = p_league_id;

  -- Calculate whose turn it is
  SELECT * INTO v_current_round, v_current_picker_index
  FROM get_snake_picker_index(v_total_picks, v_total_members);

  v_current_picker_user_id := v_draft_order[v_current_picker_index + 1]; -- Arrays are 1-indexed

  -- Verify it's this user's turn
  IF v_current_picker_user_id != p_user_id THEN
    error_code := 'NOT_YOUR_TURN';
    error_message := 'Not your turn to pick';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Check castaway not already picked
  SELECT EXISTS(
    SELECT 1 FROM rosters
    WHERE league_id = p_league_id AND castaway_id = p_castaway_id
  ) INTO v_castaway_already_picked;

  IF v_castaway_already_picked THEN
    error_code := 'CASTAWAY_ALREADY_PICKED';
    error_message := 'Castaway already drafted';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Check user doesn't already have 2 castaways
  SELECT COUNT(*) INTO v_user_pick_count
  FROM rosters
  WHERE league_id = p_league_id AND user_id = p_user_id;

  IF v_user_pick_count >= 2 THEN
    error_code := 'MAX_PICKS_REACHED';
    error_message := 'You already have 2 castaways';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Insert the pick
  INSERT INTO rosters (
    league_id,
    user_id,
    castaway_id,
    draft_round,
    draft_pick,
    acquired_via
  ) VALUES (
    p_league_id,
    p_user_id,
    p_castaway_id,
    v_current_round,
    v_total_picks + 1,
    'draft'
  )
  RETURNING id INTO v_roster_id;

  roster_id := v_roster_id;
  draft_round := v_current_round;
  draft_pick := v_total_picks + 1;

  -- Check if draft is complete
  is_draft_complete := (v_total_picks + 1) >= (v_total_members * 2);

  IF is_draft_complete THEN
    -- Update league status
    UPDATE leagues
    SET draft_status = 'completed',
        draft_completed_at = NOW(),
        status = 'active'
    WHERE id = p_league_id;

    next_picker_user_id := NULL;
  ELSE
    -- Calculate next picker
    SELECT * INTO v_current_round, v_next_picker_index
    FROM get_snake_picker_index(v_total_picks + 1, v_total_members);

    next_picker_user_id := v_draft_order[v_next_picker_index + 1];
  END IF;

  error_code := NULL;
  error_message := NULL;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION submit_draft_pick TO authenticated;
GRANT EXECUTE ON FUNCTION get_snake_picker_index TO authenticated;
