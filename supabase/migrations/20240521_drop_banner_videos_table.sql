-- Drop the banner_videos table if it exists
DROP TABLE IF EXISTS banner_videos CASCADE;

-- Drop the banner-videos storage bucket if it exists
DO $$
DECLARE
    bucket_exists BOOLEAN;
BEGIN
    -- Check if the bucket exists
    SELECT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'banner-videos'
    ) INTO bucket_exists;
    
    -- If the bucket exists, drop it
    IF bucket_exists THEN
        -- Remove all objects from the bucket first
        DELETE FROM storage.objects WHERE bucket_id = (SELECT id FROM storage.buckets WHERE name = 'banner-videos');
        
        -- Then drop the bucket
        DELETE FROM storage.buckets WHERE name = 'banner-videos';
    END IF;
END $$;
