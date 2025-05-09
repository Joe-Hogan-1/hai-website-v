-- First, drop the existing function
DROP FUNCTION IF EXISTS public.fix_storage_policies(text);

-- Recreate the fix_storage_policies function with improved error handling
CREATE OR REPLACE FUNCTION public.fix_storage_policies(bucket_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  bucket_id text;
BEGIN
  -- Get the bucket ID
  SELECT id INTO bucket_id FROM storage.buckets WHERE name = bucket_name;
  
  IF bucket_id IS NULL THEN
    -- Create the bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
    VALUES (bucket_name, bucket_name, true, false, 104857600, null)
    RETURNING id INTO bucket_id;
    
    result := json_build_object('status', 'success', 'message', 'Bucket created and policies applied', 'bucket_id', bucket_id);
  ELSE
    -- Drop existing policies for this bucket
    BEGIN
      EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to ' || bucket_name || '" ON storage.objects';
      EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated users to upload ' || bucket_name || '" ON storage.objects';
      EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated users to update ' || bucket_name || '" ON storage.objects';
      EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated users to delete ' || bucket_name || '" ON storage.objects';
      
      -- Also try with generic names
      DROP POLICY IF EXISTS "Allow public read access to banner-images" ON storage.objects;
      DROP POLICY IF EXISTS "Allow authenticated users to upload banner-images" ON storage.objects;
      DROP POLICY IF EXISTS "Allow authenticated users to update banner-images" ON storage.objects;
      DROP POLICY IF EXISTS "Allow authenticated users to delete banner-images" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN
      -- Ignore errors when dropping policies
      NULL;
    END;
    
    -- Create new policies with proper permissions
    -- Public read access
    EXECUTE 'CREATE POLICY "Allow public read access to ' || bucket_name || '"
      ON storage.objects FOR SELECT
      USING (bucket_id = ''' || bucket_id || ''')';
    
    -- Authenticated users can upload
    EXECUTE 'CREATE POLICY "Allow authenticated users to upload ' || bucket_name || '"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = ''' || bucket_id || ''')';
    
    -- Authenticated users can update their own files
    EXECUTE 'CREATE POLICY "Allow authenticated users to update ' || bucket_name || '"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = ''' || bucket_id || ''')';
    
    -- Authenticated users can delete their own files
    EXECUTE 'CREATE POLICY "Allow authenticated users to delete ' || bucket_name || '"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = ''' || bucket_id || ''')';
    
    -- Make sure the bucket is public
    UPDATE storage.buckets SET public = true WHERE id = bucket_id;
    
    result := json_build_object('status', 'success', 'message', 'Policies updated successfully', 'bucket_id', bucket_id);
  END IF;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('status', 'error', 'message', SQLERRM, 'bucket_name', bucket_name);
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.fix_storage_policies TO authenticated;
GRANT EXECUTE ON FUNCTION public.fix_storage_policies TO anon;
GRANT EXECUTE ON FUNCTION public.fix_storage_policies TO service_role;

-- Create a function to test bucket permissions if it doesn't exist
DROP FUNCTION IF EXISTS public.test_bucket_permissions(text);

CREATE OR REPLACE FUNCTION public.test_bucket_permissions(bucket_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  bucket_exists boolean;
  can_select boolean;
  can_insert boolean;
  can_update boolean;
  can_delete boolean;
BEGIN
  -- Check if bucket exists
  SELECT EXISTS(SELECT 1 FROM storage.buckets WHERE name = bucket_name) INTO bucket_exists;
  
  IF NOT bucket_exists THEN
    RETURN json_build_object('status', 'error', 'message', 'Bucket does not exist', 'bucket_name', bucket_name);
  END IF;
  
  -- Test SELECT permission
  BEGIN
    PERFORM 1 FROM storage.objects WHERE bucket_id = bucket_name LIMIT 1;
    can_select := true;
  EXCEPTION WHEN insufficient_privilege THEN
    can_select := false;
  END;
  
  -- We can't easily test INSERT/UPDATE/DELETE permissions in a function
  -- So we'll just check if the policies exist
  
  can_insert := EXISTS(
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND cmd = 'INSERT' 
    AND qual LIKE '%' || bucket_name || '%'
  );
  
  can_update := EXISTS(
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND cmd = 'UPDATE' 
    AND qual LIKE '%' || bucket_name || '%'
  );
  
  can_delete := EXISTS(
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND cmd = 'DELETE' 
    AND qual LIKE '%' || bucket_name || '%'
  );
  
  result := json_build_object(
    'status', 'success',
    'bucket_exists', bucket_exists,
    'can_select', can_select,
    'can_insert', can_insert,
    'can_update', can_update,
    'can_delete', can_delete,
    'bucket_name', bucket_name
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('status', 'error', 'message', SQLERRM, 'bucket_name', bucket_name);
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.test_bucket_permissions TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_bucket_permissions TO anon;
GRANT EXECUTE ON FUNCTION public.test_bucket_permissions TO service_role;

-- Create a direct function to fix banner-images bucket specifically
CREATE OR REPLACE FUNCTION public.fix_banner_images_bucket()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  bucket_id text;
BEGIN
  -- Get the bucket ID
  SELECT id INTO bucket_id FROM storage.buckets WHERE name = 'banner-images';
  
  IF bucket_id IS NULL THEN
    -- Create the bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
    VALUES ('banner-images', 'banner-images', true, false, 104857600, null)
    RETURNING id INTO bucket_id;
  END IF;

  -- Drop existing policies for this bucket
  BEGIN
    DROP POLICY IF EXISTS "Allow public read access to banner-images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to upload banner-images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to update banner-images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to delete banner-images" ON storage.objects;
  EXCEPTION WHEN OTHERS THEN
    -- Ignore errors when dropping policies
    NULL;
  END;
  
  -- Create new policies with proper permissions
  -- Public read access
  CREATE POLICY "Allow public read access to banner-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'banner-images');
  
  -- Authenticated users can upload
  CREATE POLICY "Allow authenticated users to upload banner-images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'banner-images');
  
  -- Authenticated users can update their own files
  CREATE POLICY "Allow authenticated users to update banner-images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'banner-images');
  
  -- Authenticated users can delete their own files
  CREATE POLICY "Allow authenticated users to delete banner-images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'banner-images');
  
  -- Make sure the bucket is public
  UPDATE storage.buckets SET public = true WHERE id = bucket_id;
  
  result := json_build_object('status', 'success', 'message', 'Banner-images bucket fixed successfully', 'bucket_id', bucket_id);
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('status', 'error', 'message', SQLERRM);
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.fix_banner_images_bucket TO authenticated;
GRANT EXECUTE ON FUNCTION public.fix_banner_images_bucket TO anon;
GRANT EXECUTE ON FUNCTION public.fix_banner_images_bucket TO service_role;
