CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (key, value) 
VALUES ('coming_soon_mode', '{"active": false, "message": "We are launching soon! Please enter your email to be the first to know."}')
ON CONFLICT (key) DO NOTHING;

-- Create RLS policies
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy for reading site settings - anyone can read
CREATE POLICY "Anyone can read site settings" ON site_settings
  FOR SELECT USING (true);

-- Policy for editing site settings - only authenticated users
CREATE POLICY "Only authenticated users can update site settings" ON site_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Function to get a setting by key
CREATE OR REPLACE FUNCTION get_site_setting(setting_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  setting_value JSONB;
BEGIN
  SELECT value INTO setting_value FROM site_settings WHERE key = setting_key;
  RETURN setting_value;
END;
$$;
