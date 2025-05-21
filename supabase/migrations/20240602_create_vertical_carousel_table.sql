-- Create a table for the vertical carousel images
CREATE TABLE IF NOT EXISTS vertical_carousel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  link_url TEXT,
  link_text TEXT,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE vertical_carousel ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access to vertical_carousel" 
  ON vertical_carousel FOR SELECT 
  USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users to insert into vertical_carousel" 
  ON vertical_carousel FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update vertical_carousel" 
  ON vertical_carousel FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete from vertical_carousel" 
  ON vertical_carousel FOR DELETE 
  USING (auth.role() = 'authenticated');
