-- Function to fix storage bucket policies
CREATE OR REPLACE FUNCTION fix_storage_bucket_policies(bucket_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  -- Check if the bucket exists
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = bucket_name
  ) INTO bucket_exists;
  
  -- Create the bucket if it doesn't exist
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES (bucket_name, bucket_name, true);
  ELSE
    -- Update the bucket to be public
    UPDATE storage.buckets SET public = true WHERE name = bucket_name;
  END IF;
  
  -- Delete existing policies for this bucket to avoid duplicates
  DELETE FROM storage.policies WHERE bucket_id = bucket_name;
  
  -- Create policies for the bucket
  INSERT INTO storage.policies (name, bucket_id, definition, permission)
  VALUES 
    ('Allow public read access', bucket_name, jsonb_build_object('bucket_id', bucket_name), 'SELECT'),
    ('Allow authenticated users to upload', bucket_name, jsonb_build_object('bucket_id', bucket_name, 'auth.role', 'authenticated'), 'INSERT'),
    ('Allow authenticated users to update', bucket_name, jsonb_build_object('bucket_id', bucket_name, 'auth.role', 'authenticated'), 'UPDATE'),
    ('Allow authenticated users to delete', bucket_name, jsonb_build_object('bucket_id', bucket_name, 'auth.role', 'authenticated'), 'DELETE');
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing bucket policies: %', SQLERRM;
    RETURN false;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION fix_storage_bucket_policies TO authenticated;
