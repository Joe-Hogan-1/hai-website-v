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

-- Set up storage bucket policies for photo-grid
DO $$
BEGIN
  -- Insert policy for authenticated users to read photo-grid bucket
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Authenticated users can read photo-grid',
    'photo-grid',
    '{"name": "authenticated users can read", "definition": {"role": "authenticated", "operation": "read"}}'::jsonb
  )
  ON CONFLICT (name, bucket_id) DO NOTHING;

  -- Insert policy for authenticated users to insert into photo-grid bucket
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Authenticated users can upload to photo-grid',
    'photo-grid',
    '{"name": "authenticated users can upload", "definition": {"role": "authenticated", "operation": "insert"}}'::jsonb
  )
  ON CONFLICT (name, bucket_id) DO NOTHING;

  -- Insert policy for authenticated users to update their own files in photo-grid bucket
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Authenticated users can update their own files in photo-grid',
    'photo-grid',
    '{"name": "authenticated users can update", "definition": {"role": "authenticated", "operation": "update", "condition": "owner = auth.uid()"}}'::jsonb
  )
  ON CONFLICT (name, bucket_id) DO NOTHING;

  -- Insert policy for authenticated users to delete their own files in photo-grid bucket
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Authenticated users can delete their own files in photo-grid',
    'photo-grid',
    '{"name": "authenticated users can delete", "definition": {"role": "authenticated", "operation": "delete", "condition": "owner = auth.uid()"}}'::jsonb
  )
  ON CONFLICT (name, bucket_id) DO NOTHING;

  -- Insert policy for anonymous users to read photo-grid bucket
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Anonymous users can read photo-grid',
    'photo-grid',
    '{"name": "anonymous users can read", "definition": {"role": "anon", "operation": "read"}}'::jsonb
  )
  ON CONFLICT (name, bucket_id) DO NOTHING;
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

  -- Set up storage bucket policies
  -- Policy for authenticated users to read
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Authenticated users can read photo-grid',
    'photo-grid',
    '{"name": "authenticated users can read", "definition": {"role": "authenticated", "operation": "read"}}'::jsonb
  )
  ON CONFLICT (name, bucket_id) DO NOTHING;

  -- Policy for authenticated users to insert
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Authenticated users can upload to photo-grid',
    'photo-grid',
    '{"name": "authenticated users can upload", "definition": {"role": "authenticated", "operation": "insert"}}'::jsonb
  )
  ON CONFLICT (name, bucket_id) DO NOTHING;

  -- Policy for authenticated users to update their own files
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Authenticated users can update their own files in photo-grid',
    'photo-grid',
    '{"name": "authenticated users can update", "definition": {"role": "authenticated", "operation": "update", "condition": "owner = auth.uid()"}}'::jsonb
  )
  ON CONFLICT (name, bucket_id) DO NOTHING;

  -- Policy for authenticated users to delete their own files
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Authenticated users can delete their own files in photo-grid',
    'photo-grid',
    '{"name": "authenticated users can delete", "definition": {"role": "authenticated", "operation": "delete", "condition": "owner = auth.uid()"}}'::jsonb
  )
  ON CONFLICT (name, bucket_id) DO NOTHING;

  -- Policy for anonymous users to read
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Anonymous users can read photo-grid',
    'photo-grid',
    '{"name": "anonymous users can read", "definition": {"role": "anon", "operation": "read"}}'::jsonb
  )
  ON CONFLICT (name, bucket_id) DO NOTHING;

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
