-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create breaking_news table
CREATE TABLE IF NOT EXISTS breaking_news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_breaking_news_is_active ON breaking_news(is_active);

-- Enable Row Level Security
ALTER TABLE breaking_news ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
-- Allow anyone to view breaking news
DROP POLICY IF EXISTS "Allow anonymous select access to breaking_news" ON breaking_news;
CREATE POLICY "Allow anonymous select access to breaking_news" 
  ON breaking_news FOR SELECT 
  TO anon 
  USING (true);

-- Allow authenticated users to manage breaking news
DROP POLICY IF EXISTS "Allow authenticated users to manage breaking_news" ON breaking_news;
CREATE POLICY "Allow authenticated users to manage breaking_news" 
  ON breaking_news FOR ALL 
  TO authenticated 
  USING (true);

-- Insert a default breaking news entry if none exists
INSERT INTO breaking_news (text, is_active)
SELECT 'Welcome to Hai - New products coming soon!', true
WHERE NOT EXISTS (SELECT 1 FROM breaking_news);
