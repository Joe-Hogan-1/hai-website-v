-- Remove position column from banner_media table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'banner_media' 
    AND column_name = 'position'
  ) THEN
    ALTER TABLE banner_media DROP COLUMN position;
  END IF;
END $$;

-- Remove position column from banner_videos table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'banner_videos' 
    AND column_name = 'position'
  ) THEN
    ALTER TABLE banner_videos DROP COLUMN position;
  END IF;
END $$;
