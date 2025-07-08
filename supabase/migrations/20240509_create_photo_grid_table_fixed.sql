CREATE TABLE IF NOT EXISTS photo_grid (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  row_index INTEGER NOT NULL,
  col_index INTEGER NOT NULL,
  row_span INTEGER NOT NULL DEFAULT 1,
  col_span INTEGER NOT NULL DEFAULT 1
);

-- Add link_url column to photo_grid table
ALTER TABLE photo_grid ADD COLUMN IF NOT EXISTS link_url TEXT;

-- Add link_text column to photo_grid table  
ALTER TABLE photo_grid ADD COLUMN IF NOT EXISTS link_text TEXT;
