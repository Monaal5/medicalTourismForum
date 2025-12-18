-- Migration to add category_id and total_votes to existing polls table
-- Run this if you already have a polls table without these columns
-- This script is safe to run multiple times

-- Add category_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'polls' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE polls ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added category_id column to polls table';
    ELSE
        RAISE NOTICE 'category_id column already exists in polls table';
    END IF;
END $$;

-- Add total_votes column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'polls' AND column_name = 'total_votes'
    ) THEN
        ALTER TABLE polls ADD COLUMN total_votes INT DEFAULT 0;
        RAISE NOTICE 'Added total_votes column to polls table';
    ELSE
        RAISE NOTICE 'total_votes column already exists in polls table';
    END IF;
END $$;

-- Add option_order column to poll_options if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'poll_options' AND column_name = 'option_order'
    ) THEN
        ALTER TABLE poll_options ADD COLUMN option_order INT DEFAULT 0;
        RAISE NOTICE 'Added option_order column to poll_options table';
    ELSE
        RAISE NOTICE 'option_order column already exists in poll_options table';
    END IF;
END $$;

-- Update existing polls to have total_votes = 0 if NULL
UPDATE polls SET total_votes = 0 WHERE total_votes IS NULL;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
END $$;
