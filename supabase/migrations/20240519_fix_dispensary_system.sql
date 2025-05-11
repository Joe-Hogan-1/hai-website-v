-- Create the dispensaries table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.dispensaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    phone TEXT,
    website TEXT,
    image_url TEXT,
    has_hai_products BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    -- Note: We're not adding user_id here to match your existing table
);

-- Enable Row Level Security
ALTER TABLE public.dispensaries ENABLE ROW LEVEL SECURITY;

-- Create policies for the dispensaries table
DROP POLICY IF EXISTS "Allow public read access to dispensaries" ON public.dispensaries;
CREATE POLICY "Allow public read access to dispensaries"
  ON public.dispensaries
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage dispensaries" ON public.dispensaries;
CREATE POLICY "Allow authenticated users to manage dispensaries"
  ON public.dispensaries
  FOR ALL
  TO authenticated
  USING (true);

-- Create a function to create the storage bucket if it doesn't exist
CREATE OR REPLACE FUNCTION create_dispensary_images_bucket()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  -- Check if the bucket exists
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'dispensary-images'
  ) INTO bucket_exists;
  
  -- Create the bucket if it doesn't exist
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('dispensary-images', 'dispensary-images', true);
    
    -- Set up policies for the bucket
    INSERT INTO storage.policies (name, bucket_id, permission, definition)
    VALUES 
      ('Public Read Access', 'dispensary-images', 'SELECT', '{"bucket_id":"dispensary-images"}'),
      ('Authenticated Users Can Upload', 'dispensary-images', 'INSERT', '{"bucket_id":"dispensary-images","auth.role":"authenticated"}'),
      ('Authenticated Users Can Update', 'dispensary-images', 'UPDATE', '{"bucket_id":"dispensary-images","auth.role":"authenticated"}'),
      ('Authenticated Users Can Delete', 'dispensary-images', 'DELETE', '{"bucket_id":"dispensary-images","auth.role":"authenticated"}');
  END IF;
END;
$$;

-- Execute the function to create the bucket
SELECT create_dispensary_images_bucket();

-- Drop the function after use
DROP FUNCTION create_dispensary_images_bucket();
