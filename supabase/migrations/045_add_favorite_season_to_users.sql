-- Add favorite_season column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_season TEXT;
