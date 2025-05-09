-- Create a function to fix storage policies for a specific bucket
CREATE OR REPLACE FUNCTION fix_storage_policies(bucket_name TEXT)
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
    USING (bucket_id = bucket_name);

    -- Allow authenticated users to upload files
    CREATE POLICY "Allow authenticated users to upload files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = bucket_name);

    -- Allow authenticated users to update their own files
    CREATE POLICY "Allow authenticated users to update their own files"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = bucket_name AND (auth.uid() = owner));

    -- Allow authenticated users to delete their own files
    CREATE POLICY "Allow authenticated users to delete their own files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = bucket_name AND (auth.uid() = owner));
END;
$$ LANGUAGE plpgsql;
