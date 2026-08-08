-- Add theme preference columns to users table
-- This migration adds support for the multi-theme system

-- Add theme columns if they don't exist
DO $$ 
BEGIN
  -- Add theme_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'theme_name'
  ) THEN
    ALTER TABLE users ADD COLUMN theme_name TEXT DEFAULT 'midnight-navy';
  END IF;

  -- Add theme_mode column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'theme_mode'
  ) THEN
    ALTER TABLE users ADD COLUMN theme_mode TEXT DEFAULT 'dark';
  END IF;
END $$;

-- Add check constraint for valid theme names
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_theme_name_check'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_theme_name_check 
    CHECK (theme_name IN ('midnight-navy', 'dusty-bloom', 'emerald-prestige', 'sakura-mauve', 'violet-dusk'));
  END IF;
END $$;

-- Add check constraint for valid theme modes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_theme_mode_check'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_theme_mode_check 
    CHECK (theme_mode IN ('light', 'dark'));
  END IF;
END $$;

-- Create index for faster theme queries
CREATE INDEX IF NOT EXISTS idx_users_theme ON users(theme_name, theme_mode);

-- Update existing users to have default theme (midnight-navy, dark)
UPDATE users 
SET theme_name = 'midnight-navy', theme_mode = 'dark'
WHERE theme_name IS NULL OR theme_mode IS NULL;

COMMENT ON COLUMN users.theme_name IS 'User selected visual theme (midnight-navy, dusty-bloom, emerald-prestige, sakura-mauve, violet-dusk)';
COMMENT ON COLUMN users.theme_mode IS 'User selected theme mode (light or dark)';
