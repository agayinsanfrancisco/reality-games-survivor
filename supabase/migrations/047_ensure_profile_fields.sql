-- Ensure all profile fields exist on users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS hometown TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_castaway TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_season TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS season_50_winner_prediction UUID REFERENCES castaways(id);
