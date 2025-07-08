-- Add link functionality to photo_grid table
ALTER TABLE photo_grid ADD COLUMN IF NOT EXISTS link_url TEXT;
ALTER TABLE photo_grid ADD COLUMN IF NOT EXISTS link_text TEXT;

-- Add link functionality to grid_images table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'grid_images') THEN
        ALTER TABLE grid_images ADD COLUMN IF NOT EXISTS link_url TEXT;
        ALTER TABLE grid_images ADD COLUMN IF NOT EXISTS link_text TEXT;
    END IF;
END $$;
