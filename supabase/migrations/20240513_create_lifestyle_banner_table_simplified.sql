-- Create extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the lifestyle_banner table if it doesn't exist
CREATE TABLE IF NOT EXISTS lifestyle_banner (
  id SERIAL PRIMARY KEY,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_active BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lifestyle_banner_is_active ON lifestyle_banner(is_active);
CREATE INDEX IF NOT EXISTS idx_lifestyle_banner_user_id ON lifestyle_banner(user_id);
CREATE INDEX IF NOT EXISTS idx_lifestyle_banner_created_at ON lifestyle_banner(created_at);

-- Enable Row Level Security
ALTER TABLE lifestyle_banner ENABLE ROW LEVEL SECURITY;

-- Create function for updating timestamp
CREATE OR REPLACE FUNCTION update_lifestyle_banner_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists to avoid errors when recreating
DROP TRIGGER IF EXISTS update_lifestyle_banner_updated_at ON lifestyle_banner;

-- Create trigger
CREATE TRIGGER update_lifestyle_banner_updated_at
BEFORE UPDATE ON lifestyle_banner
FOR EACH ROW
EXECUTE FUNCTION update_lifestyle_banner_modified_column();

-- Create policies (using simple statements instead of DO blocks)
-- First drop existing policies to avoid errors
DROP POLICY IF EXISTS "Allow public read access to active lifestyle banner" ON lifestyle_banner;
DROP POLICY IF EXISTS "Allow authenticated users to read all lifestyle banner" ON lifestyle_banner;
DROP POLICY IF EXISTS "Allow authenticated users to insert lifestyle banner" ON lifestyle_banner;
DROP POLICY IF EXISTS "Allow authenticated users to update lifestyle banner" ON lifestyle_banner;
DROP POLICY IF EXISTS "Allow authenticated users to delete lifestyle banner" ON lifestyle_banner;

-- Create policies
CREATE POLICY "Allow public read access to active lifestyle banner"
  ON lifestyle_banner
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow authenticated users to read all lifestyle banner"
  ON lifestyle_banner
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert lifestyle banner"
  ON lifestyle_banner
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update lifestyle banner"
  ON lifestyle_banner
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete lifestyle banner"
  ON lifestyle_banner
  FOR DELETE
  TO authenticated
  USING (true);
