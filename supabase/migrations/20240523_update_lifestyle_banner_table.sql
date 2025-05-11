-- This migration updates the lifestyle_banner table to support multiple active banners

-- First, check if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'lifestyle_banner') THEN
    -- Table exists, so we can proceed with modifications
    
    -- Make sure the is_active column exists and has the right default
    IF EXISTS (SELECT FROM information_schema.columns 
               WHERE table_name = 'lifestyle_banner' AND column_name = 'is_active') THEN
      -- Column exists, update its default if needed
      ALTER TABLE lifestyle_banner ALTER COLUMN is_active SET DEFAULT true;
    ELSE
      -- Column doesn't exist, add it
      ALTER TABLE lifestyle_banner ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Make sure we have the right indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_lifestyle_banner_is_active') THEN
      CREATE INDEX idx_lifestyle_banner_is_active ON lifestyle_banner(is_active);
    END IF;
    
    -- Update policies to allow multiple active banners
    -- First drop the existing policy if it exists
    DROP POLICY IF EXISTS "Allow public read access to active lifestyle banner" ON lifestyle_banner;
    
    -- Create the updated policy
    CREATE POLICY "Allow public read access to active lifestyle banners"
      ON lifestyle_banner
      FOR SELECT
      TO public
      USING (is_active = true);
      
  END IF;
END
$$;
