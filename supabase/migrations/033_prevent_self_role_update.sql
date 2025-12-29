-- Migration: 033_prevent_self_role_update.sql
-- Description: Prevent users from updating their own role field via direct Supabase calls
-- This is a defense-in-depth measure - role updates should only happen via backend API
-- with proper admin authorization

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS users_update_own ON users;
DROP POLICY IF EXISTS users_update_own_no_role ON users;

-- Create a more restrictive update policy that prevents role self-modification
-- Users can update their own profile fields, but NOT the role field
CREATE POLICY users_update_own_profile ON users
  FOR UPDATE 
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() AND
    -- Ensure role field is not being changed (must match current value)
    role = (SELECT role FROM users WHERE id = auth.uid())
  );

-- Add a comment explaining the policy
COMMENT ON POLICY users_update_own_profile ON users IS 
  'Users can update their own profile but cannot change their role. Role updates must go through the backend API with admin authorization.';

-- Create an admin-only policy for role updates
-- This allows the service role (backend) to update any user including role
-- Note: This policy uses a function to check if the caller is using service role
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS boolean AS $$
BEGIN
  -- The service role bypasses RLS, so this function is mainly for documentation
  -- The actual protection comes from the users_update_own_profile policy
  RETURN current_setting('request.jwt.claims', true)::json->>'role' = 'service_role';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index on role column for faster policy checks
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
