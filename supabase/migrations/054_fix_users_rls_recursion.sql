-- Migration 054: Fix infinite recursion in users RLS policy
-- The users_update_own_profile policy causes infinite recursion because it
-- queries the users table within its own RLS check.
-- 
-- Solution: Use a SECURITY DEFINER function that bypasses RLS to get the current role.

-- Create a function to get the current user's role without triggering RLS
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
DECLARE
  my_role user_role;
BEGIN
  SELECT role INTO my_role FROM users WHERE id = auth.uid();
  RETURN my_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_my_role() TO authenticated;

-- Drop the problematic policies
DROP POLICY IF EXISTS users_update_own_profile ON users;
DROP POLICY IF EXISTS users_prevent_self_role_update ON users;
DROP POLICY IF EXISTS users_update_own ON users;

-- Recreate the update policy using the safe function
CREATE POLICY users_update_own_profile ON users
  FOR UPDATE 
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (
    id = (SELECT auth.uid()) AND
    -- Ensure role field is not being changed (must match current value)
    -- Uses SECURITY DEFINER function to avoid RLS recursion
    (role = get_my_role() OR get_my_role() = 'admin')
  );

COMMENT ON POLICY users_update_own_profile ON users IS 
  'Users can update their own profile but cannot change their role (unless admin). Role updates must go through the backend API with admin authorization.';
