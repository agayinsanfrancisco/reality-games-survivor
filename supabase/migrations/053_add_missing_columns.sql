-- ============================================
-- ADD MISSING COLUMNS
-- Migration 053: Add week_number to episodes and photo_url to leagues
-- These columns are referenced in TypeScript types but were never created
-- ============================================

-- Add week_number to episodes table
-- This is computed as the episode number within the season
ALTER TABLE episodes 
ADD COLUMN IF NOT EXISTS week_number INTEGER;

-- Backfill week_number from episode number (they're typically the same)
UPDATE episodes 
SET week_number = number 
WHERE week_number IS NULL;

-- Add photo_url to leagues table for custom league branding
ALTER TABLE leagues 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN episodes.week_number IS 'Week number within the season (may differ from episode number for multi-episode weeks)';
COMMENT ON COLUMN leagues.photo_url IS 'Optional custom photo/logo URL for the league';

-- Create index for week_number queries
CREATE INDEX IF NOT EXISTS idx_episodes_week_number ON episodes(season_id, week_number);
