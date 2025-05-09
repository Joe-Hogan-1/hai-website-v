-- Function to create a storage bucket
CREATE OR REPLACE FUNCTION create_storage_bucket(bucket_id TEXT, bucket_public BOOLEAN)
RETURNS VOID AS $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES (bucket_id, bucket_id, bucket_public)
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create storage policies
CREATE OR REPLACE FUNCTION create_storage_policies()
RETURNS VOID AS $$
BEGIN
  -- Remove any existing policies for this bucket to avoid conflicts
  DROP POLICY IF EXISTS "Allow public read access to all files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated users to update their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated users to delete their own files" ON storage.objects;

  -- Allow public read access to all files
  CREATE POLICY "Allow public read access to all files"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'banner-images');

  -- Allow authenticated users to upload files
  CREATE POLICY "Allow authenticated users to upload files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'banner-images');

  -- Allow authenticated users to update their own files
  CREATE POLICY "Allow authenticated users to update their own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'banner-images');

  -- Allow authenticated users to delete their own files
  CREATE POLICY "Allow authenticated users to delete their own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'banner-images');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all policies
CREATE OR REPLACE FUNCTION get_policies()
RETURNS TABLE (
  schemaname TEXT,
  tablename TEXT,
  policyname TEXT,
  permissive TEXT,
  roles TEXT[],
  cmd TEXT,
  qual TEXT,
  with_check TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.nspname::TEXT AS schemaname,
    c.relname::TEXT AS tablename,
    p.polname::TEXT AS policyname,
    CASE WHEN p.polpermissive THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END::TEXT AS permissive,
    ARRAY(
      SELECT rolname::TEXT
      FROM pg_roles
      WHERE oid = ANY(p.polroles)
    ) AS roles,
    CASE p.polcmd
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
      WHEN '*' THEN 'ALL'
    END::TEXT AS cmd,
    pg_get_expr(p.polqual, p.polrelid)::TEXT AS qual,
    pg_get_expr(p.polwithcheck, p.polrelid)::TEXT AS with_check
  FROM pg_policy p
  JOIN pg_class c ON p.polrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  ORDER BY n.nspname, c.relname, p.polname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
