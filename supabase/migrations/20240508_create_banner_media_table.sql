-- Create banner_media table for the Homepage Carousel
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop the table if it exists to ensure a clean slate
DROP TABLE IF EXISTS banner_media CASCADE;

-- Create the banner_media table
CREATE TABLE banner_media (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  text_overlay TEXT,
  text_position TEXT DEFAULT 'bottom-left' CHECK (text_position IN ('top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right')),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_banner_media_is_active ON banner_media(is_active);
CREATE INDEX idx_banner_media_display_order ON banner_media(display_order);
CREATE INDEX idx_banner_media_user_id ON banner_media(user_id);
CREATE INDEX idx_banner_media_created_at ON banner_media(created_at);

-- Enable Row Level Security
ALTER TABLE banner_media ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to read active banner media
CREATE POLICY "Allow public read access to active banner media"
  ON banner_media
  FOR SELECT
  TO public
  USING (is_active = true);

-- Allow authenticated users to read all banner media (including inactive)
CREATE POLICY "Allow authenticated users to read all banner media"
  ON banner_media
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert banner media
CREATE POLICY "Allow authenticated users to insert banner media"
  ON banner_media
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update banner media
CREATE POLICY "Allow authenticated users to update banner media"
  ON banner_media
  FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete banner media
CREATE POLICY "Allow authenticated users to delete banner media"
  ON banner_media
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample data
INSERT INTO banner_media (title, description, media_url, media_type, text_overlay, text_position, is_active, display_order)
VALUES 
('Welcome to hai', 'Discover our premium products', '/placeholder.svg?height=800&width=1200&query=serene+landscape', 'image', 'Welcome to hai', 'bottom-left', true, 1),
('Premium Products', 'Explore our selection', '/placeholder.svg?height=800&width=1200&query=premium+products', 'image', 'Premium Products', 'middle-center', true, 2);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_banner_media_updated_at
BEFORE UPDATE ON banner_media
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
