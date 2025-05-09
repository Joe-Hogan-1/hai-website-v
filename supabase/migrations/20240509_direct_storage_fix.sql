-- Direct fix for banner-images bucket permissions
-- This focuses only on fixing the permissions, not recreating the bucket

-- First, get the exact bucket name with correct case
DO $$
DECLARE
  bucket_name text;
  bucket_exists boolean;
BEGIN
  -- Check if the bucket exists (case insensitive)
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets 
    WHERE lower(name) = 'banner-images'
  ) INTO bucket_exists;
  
  IF NOT bucket_exists THEN
    RAISE EXCEPTION 'Bucket banner-images does not exist';
  END IF;
  
  -- Get the exact bucket name with correct case
  SELECT name INTO bucket_name FROM storage.buckets 
  WHERE lower(name) = 'banner-images';
  
  -- Drop existing policies for this bucket
  EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to ' || bucket_name || '" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated users to upload ' || bucket_name || '" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated users to update ' || bucket_name || '" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated users to delete ' || bucket_name || '" ON storage.objects';
  
  -- Create new policies with proper permissions
  -- Public read access
  EXECUTE 'CREATE POLICY "Allow public read access to ' || bucket_name || '"
    ON storage.objects FOR SELECT
    USING (bucket_id = ''' || bucket_name || ''')';
  
  -- Authenticated users can upload
  EXECUTE 'CREATE POLICY "Allow authenticated users to upload ' || bucket_name || '"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = ''' || bucket_name || ''')';
  
  -- Authenticated users can update files
  EXECUTE 'CREATE POLICY "Allow authenticated users to update ' || bucket_name || '"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = ''' || bucket_name || ''')';
  
  -- Authenticated users can delete files
  EXECUTE 'CREATE POLICY "Allow authenticated users to delete ' || bucket_name || '"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = ''' || bucket_name || ''')';
  
  -- Make sure the bucket is public
  UPDATE storage.buckets SET public = true WHERE name = bucket_name;
  
  RAISE NOTICE 'Successfully fixed permissions for bucket: %', bucket_name;
END $$;
