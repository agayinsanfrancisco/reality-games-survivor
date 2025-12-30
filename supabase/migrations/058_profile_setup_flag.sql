-- Add explicit profile setup completion flag
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS profile_setup_complete BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill: mark users complete when their display_name is not the email prefix
UPDATE public.users
SET profile_setup_complete = TRUE,
    updated_at = NOW()
WHERE profile_setup_complete = FALSE
  AND display_name IS NOT NULL
  AND display_name <> split_part(email, '@', 1);

COMMENT ON COLUMN public.users.profile_setup_complete IS
  'Tracks whether the user finished onboarding/profile setup.';
