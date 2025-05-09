-- This migration removes the text_overlay columns from banner_media and banner_videos tables

-- Remove text_overlay column from banner_media table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'banner_media' 
    AND column_name = 'text_overlay'
  ) THEN
    ALTER TABLE public.banner_media DROP COLUMN text_overlay;
  END IF;
END $$;

-- Remove text_position column from banner_media table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'banner_media' 
    AND column_name = 'text_position'
  ) THEN
    ALTER TABLE public.banner_media DROP COLUMN text_position;
  END IF;
END $$;

-- Remove text_overlay column from banner_videos table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'banner_videos' 
    AND column_name = 'text_overlay'
  ) THEN
    ALTER TABLE public.banner_videos DROP COLUMN text_overlay;
  END IF;
END $$;

-- Remove text_position column from banner_videos table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'banner_videos' 
    AND column_name = 'text_position'
  ) THEN
    ALTER TABLE public.banner_videos DROP COLUMN text_position;
  END IF;
END $$;
