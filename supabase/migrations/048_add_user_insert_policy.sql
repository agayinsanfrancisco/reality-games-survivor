-- Allow users to insert their own profile record if it doesn't exist
-- This acts as a fallback if the auth trigger handle_new_user fails or is delayed
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'users_insert_own'
    ) THEN
        CREATE POLICY users_insert_own ON users FOR INSERT WITH CHECK (id = auth.uid());
    END IF;
END $$;
