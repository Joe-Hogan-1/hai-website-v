-- Create photo_grid table if it doesn't exist
CREATE TABLE IF NOT EXISTS photo_grid (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  position INTEGER NOT NULL,
  title TEXT,
  description TEXT,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_photo_grid_position ON photo_grid(position);
CREATE INDEX IF NOT EXISTS idx_photo_grid_user_id ON photo_grid(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE photo_grid ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users with explicit type casting
CREATE POLICY "Authenticated users can read all photo grid images"
  ON photo_grid FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert photo grid images"
  ON photo_grid FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update their own photo grid images"
  ON photo_grid FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::TEXT);

CREATE POLICY "Authenticated users can delete their own photo grid images"
  ON photo_grid FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::TEXT);

-- Create policies for anonymous users
CREATE POLICY "Anonymous users can read photo grid images"
  ON photo_grid FOR SELECT
  TO anon
  USING (true);

-- Create a storage bucket for photo grid images if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('photo-grid', 'photo-grid', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Set up storage bucket policies for photo-grid using the correct approach
DO $$
BEGIN
  -- Remove any existing policies for this bucket to avoid conflicts
  DROP POLICY IF EXISTS "Allow public read access to photo-grid" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated users to upload photo-grid" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated users to update photo-grid" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated users to delete photo-grid" ON storage.objects;
  
  -- Create new policies with proper permissions
  -- Public read access
  CREATE POLICY "Allow public read access to photo-grid"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'photo-grid');
  
  -- Authenticated users can upload
  CREATE POLICY "Allow authenticated users to upload photo-grid"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'photo-grid');
  
  -- Authenticated users can update their own files
  CREATE POLICY "Allow authenticated users to update photo-grid"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'photo-grid' AND (auth.uid() = owner));
  
  -- Authenticated users can delete their own files
  CREATE POLICY "Allow authenticated users to delete photo-grid"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'photo-grid' AND (auth.uid() = owner));
END $$;

-- Create a function to create the photo_grid table if it doesn't exist
CREATE OR REPLACE FUNCTION create_photo_grid_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'photo_grid'
  ) THEN
    -- Create the photo_grid table
    CREATE TABLE public.photo_grid (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      image_url TEXT NOT NULL,
      position INTEGER NOT NULL,
      title TEXT,
      description TEXT,
      user_id TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes
    CREATE INDEX idx_photo_grid_position ON photo_grid(position);
    CREATE INDEX idx_photo_grid_user_id ON photo_grid(user_id);
    
    -- Enable RLS
    ALTER TABLE photo_grid ENABLE ROW LEVEL SECURITY;
    
    -- Create policies with explicit type casting
    CREATE POLICY "Authenticated users can read all photo grid images"
      ON photo_grid FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Authenticated users can insert photo grid images"
      ON photo_grid FOR INSERT
      TO authenticated
      WITH CHECK (true);

    CREATE POLICY "Authenticated users can update their own photo grid images"
      ON photo_grid FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid()::TEXT);

    CREATE POLICY "Authenticated users can delete their own photo grid images"
      ON photo_grid FOR DELETE
      TO authenticated
      USING (user_id = auth.uid()::TEXT);

    CREATE POLICY "Anonymous users can read photo grid images"
      ON photo_grid FOR SELECT
      TO anon
      USING (true);
  END IF;
END;
$$;

-- Create a function to fix photo-grid bucket permissions
CREATE OR REPLACE FUNCTION fix_photo_grid_bucket()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bucket_exists BOOLEAN;
  result jsonb;
BEGIN
  -- Check if the bucket exists
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'photo-grid'
  ) INTO bucket_exists;

  -- Create the bucket if it doesn't exist
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('photo-grid', 'photo-grid', true);
    
    result = jsonb_build_object(
      'status', 'success',
      'message', 'Created photo-grid bucket',
      'bucket', 'photo-grid'
    );
  ELSE
    result = jsonb_build_object(
      'status', 'info',
      'message', 'photo-grid bucket already exists',
      'bucket', 'photo-grid'
    );
  END IF;

  -- Set up storage bucket policies using the correct approach
  BEGIN
    -- Remove any existing policies for this bucket to avoid conflicts
    DROP POLICY IF EXISTS "Allow public read access to photo-grid" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to upload photo-grid" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to update photo-grid" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated users to delete photo-grid" ON storage.objects;
    
    -- Create new policies with proper permissions
    -- Public read access
    CREATE POLICY "Allow public read access to photo-grid"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'photo-grid');
    
    -- Authenticated users can upload
    CREATE POLICY "Allow authenticated users to upload photo-grid"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'photo-grid');
    
    -- Authenticated users can update their own files
    CREATE POLICY "Allow authenticated users to update photo-grid"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'photo-grid' AND (auth.uid() = owner));
    
    -- Authenticated users can delete their own files
    CREATE POLICY "Allow authenticated users to delete photo-grid"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'photo-grid' AND (auth.uid() = owner));
  EXCEPTION
    WHEN OTHERS THEN
      -- If there's an error creating policies, add it to the result
      result = jsonb_build_object(
        'status', 'warning',
        'message', 'Created bucket but failed to set policies: ' || SQLERRM,
        'bucket', 'photo-grid'
      );
      RETURN result;
  END;

  -- Return success
  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'Photo grid bucket and policies configured successfully',
    'bucket', 'photo-grid',
    'details', result
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Failed to configure photo grid bucket: ' || SQLERRM,
      'bucket', 'photo-grid'
    );
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION fix_photo_grid_bucket() TO authenticated;
