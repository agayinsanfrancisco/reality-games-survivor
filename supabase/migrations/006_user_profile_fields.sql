-- Add profile fields for users
ALTER TABLE users ADD COLUMN IF NOT EXISTS hometown TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_castaway TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
