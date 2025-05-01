-- Add text_overlay column to banner_media table if it exists and doesn't have the column
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'banner_media'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'banner_media' 
    AND column_name = 'text_overlay'
  ) THEN
    ALTER TABLE banner_media ADD COLUMN text_overlay JSONB;
  END IF;
END $$;

-- Add text_overlay column to banner_videos table if it exists and doesn't have the column
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'banner_videos'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'banner_videos' 
    AND column_name = 'text_overlay'
  ) THEN
    ALTER TABLE banner_videos ADD COLUMN text_overlay JSONB;
  END IF;
END $$;
