-- Create table for storing user data
CREATE TABLE IF NOT EXISTS user_data (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for tracking page views
CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  path TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  referrer TEXT
);

-- Create table for tracking age verifications
CREATE TABLE IF NOT EXISTS age_verifications (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  verified BOOLEAN NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_age_verifications_user_id ON age_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_age_verifications_timestamp ON age_verifications(timestamp);

-- Add RLS (Row Level Security) policies
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (admins)
CREATE POLICY "Authenticated users can read all user data"
  ON user_data FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read all page views"
  ON page_views FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read all age verifications"
  ON age_verifications FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for anonymous users (website visitors)
CREATE POLICY "Anonymous users can insert their own data"
  ON user_data FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous users can update their own data"
  ON user_data FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Anonymous users can insert page views"
  ON page_views FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous users can insert age verifications"
  ON age_verifications FOR INSERT
  TO anon
  WITH CHECK (true);
