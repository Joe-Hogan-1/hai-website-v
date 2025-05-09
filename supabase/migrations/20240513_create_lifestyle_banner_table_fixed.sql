-- Create lifestyle_banner table
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check if the table already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lifestyle_banner') THEN
    -- Create the lifestyle_banner table
    CREATE TABLE public.lifestyle_banner (
      id SERIAL PRIMARY KEY,
      title TEXT,
      description TEXT,
      image_url TEXT NOT NULL,
      alt_text TEXT,
      is_active BOOLEAN DEFAULT true,
      user_id UUID REFERENCES auth.users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes for better performance
    CREATE INDEX idx_lifestyle_banner_is_active ON public.lifestyle_banner(is_active);
    CREATE INDEX idx_lifestyle_banner_user_id ON public.lifestyle_banner(user_id);
    CREATE INDEX idx_lifestyle_banner_created_at ON public.lifestyle_banner(created_at);

    -- Enable Row Level Security
    ALTER TABLE public.lifestyle_banner ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Create policies (outside the DO block to avoid nesting issues)
-- Allow anyone to read active lifestyle banner
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'lifestyle_banner' 
    AND policyname = 'Allow public read access to active lifestyle banner'
  ) THEN
    CREATE POLICY "Allow public read access to active lifestyle banner"
      ON public.lifestyle_banner
      FOR SELECT
      TO public
      USING (is_active = true);
  END IF;
END
$$;

-- Allow authenticated users to read all lifestyle banner (including inactive)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'lifestyle_banner' 
    AND policyname = 'Allow authenticated users to read all lifestyle banner'
  ) THEN
    CREATE POLICY "Allow authenticated users to read all lifestyle banner"
      ON public.lifestyle_banner
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END
$$;

-- Allow authenticated users to insert lifestyle banner
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'lifestyle_banner' 
    AND policyname = 'Allow authenticated users to insert lifestyle banner'
  ) THEN
    CREATE POLICY "Allow authenticated users to insert lifestyle banner"
      ON public.lifestyle_banner
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END
$$;

-- Allow authenticated users to update lifestyle banner
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'lifestyle_banner' 
    AND policyname = 'Allow authenticated users to update lifestyle banner'
  ) THEN
    CREATE POLICY "Allow authenticated users to update lifestyle banner"
      ON public.lifestyle_banner
      FOR UPDATE
      TO authenticated
      USING (true);
  END IF;
END
$$;

-- Allow authenticated users to delete lifestyle banner
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'lifestyle_banner' 
    AND policyname = 'Allow authenticated users to delete lifestyle banner'
  ) THEN
    CREATE POLICY "Allow authenticated users to delete lifestyle banner"
      ON public.lifestyle_banner
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END
$$;

-- Create a function to update the updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_proc 
    WHERE proname = 'update_lifestyle_banner_modified_column'
  ) THEN
    CREATE OR REPLACE FUNCTION update_lifestyle_banner_modified_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END
$$;

-- Create a trigger to automatically update the updated_at column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_trigger 
    WHERE tgname = 'update_lifestyle_banner_updated_at'
  ) THEN
    CREATE TRIGGER update_lifestyle_banner_updated_at
    BEFORE UPDATE ON public.lifestyle_banner
    FOR EACH ROW
    EXECUTE FUNCTION update_lifestyle_banner_modified_column();
  END IF;
END
$$;
