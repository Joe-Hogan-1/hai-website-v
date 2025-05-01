-- Create grid_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS grid_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  position INTEGER NOT NULL,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_grid_images_position ON grid_images(position);
CREATE INDEX IF NOT EXISTS idx_grid_images_user_id ON grid_images(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE grid_images ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users with explicit type casting
CREATE POLICY "Authenticated users can read all grid images"
  ON grid_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert grid images"
  ON grid_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update their own grid images"
  ON grid_images FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::TEXT);

CREATE POLICY "Authenticated users can delete their own grid images"
  ON grid_images FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::TEXT);

-- Create policies for anonymous users
CREATE POLICY "Anonymous users can read grid images"
  ON grid_images FOR SELECT
  TO anon
  USING (true);

-- Create a function to create the grid_images table if it doesn't exist
CREATE OR REPLACE FUNCTION create_grid_images_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'grid_images'
  ) THEN
    -- Create the grid_images table
    CREATE TABLE public.grid_images (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      image_url TEXT NOT NULL,
      position INTEGER NOT NULL,
      user_id TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes
    CREATE INDEX idx_grid_images_position ON grid_images(position);
    CREATE INDEX idx_grid_images_user_id ON grid_images(user_id);
    
    -- Enable RLS
    ALTER TABLE grid_images ENABLE ROW LEVEL SECURITY;
    
    -- Create policies with explicit type casting
    CREATE POLICY "Authenticated users can read all grid images"
      ON grid_images FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Authenticated users can insert grid images"
      ON grid_images FOR INSERT
      TO authenticated
      WITH CHECK (true);

    CREATE POLICY "Authenticated users can update their own grid images"
      ON grid_images FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid()::TEXT);

    CREATE POLICY "Authenticated users can delete their own grid images"
      ON grid_images FOR DELETE
      TO authenticated
      USING (user_id = auth.uid()::TEXT);

    CREATE POLICY "Anonymous users can read grid images"
      ON grid_images FOR SELECT
      TO anon
      USING (true);
  END IF;
END;
$$;
