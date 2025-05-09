-- First, check if the table exists and drop it if it does
DROP TABLE IF EXISTS breaking_news;

-- Create the breaking_news table with a simple structure
CREATE TABLE breaking_news (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_breaking_news_is_active ON breaking_news(is_active);

-- Enable Row Level Security
ALTER TABLE breaking_news ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to breaking_news" ON breaking_news;
DROP POLICY IF EXISTS "Allow authenticated users to manage breaking_news" ON breaking_news;

-- Create policies for access control
-- Allow anyone to read breaking news
CREATE POLICY "Allow public read access to breaking_news" 
  ON breaking_news FOR SELECT 
  USING (true);

-- Allow authenticated users to manage breaking news
CREATE POLICY "Allow authenticated users to manage breaking_news" 
  ON breaking_news FOR ALL 
  TO authenticated 
  USING (true);

-- Insert a default breaking news entry if the table is empty
INSERT INTO breaking_news (text, is_active)
SELECT 'Welcome to Hai - New products coming soon!', true
WHERE NOT EXISTS (SELECT 1 FROM breaking_news);
