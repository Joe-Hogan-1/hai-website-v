-- Create a table for homepage text content
CREATE TABLE IF NOT EXISTS homepage_text (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS policies
ALTER TABLE homepage_text ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "Anyone can read homepage text" ON homepage_text
  FOR SELECT USING (true);

-- Only authenticated users can insert/update/delete
CREATE POLICY "Only authenticated users can insert homepage text" ON homepage_text
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update homepage text" ON homepage_text
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete homepage text" ON homepage_text
  FOR DELETE USING (auth.role() = 'authenticated');
