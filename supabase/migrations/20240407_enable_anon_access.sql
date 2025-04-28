-- Enable anonymous inserts to these tables
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_verifications ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow anonymous inserts to user_data" ON user_data;
DROP POLICY IF EXISTS "Allow anonymous inserts to page_views" ON page_views;
DROP POLICY IF EXISTS "Allow anonymous inserts to age_verifications" ON age_verifications;

-- Create new policies that allow anonymous inserts
CREATE POLICY "Allow anonymous inserts to user_data"
ON user_data FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts to page_views"
ON page_views FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts to age_verifications"
ON age_verifications FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated users to read all data
CREATE POLICY "Allow authenticated users to read user_data"
ON user_data FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to read page_views"
ON page_views FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to read age_verifications"
ON age_verifications FOR SELECT
TO authenticated
USING (true);
