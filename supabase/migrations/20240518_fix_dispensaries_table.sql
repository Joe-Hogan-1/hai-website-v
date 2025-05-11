-- Check if the dispensaries table exists, if not create it
CREATE TABLE IF NOT EXISTS public.dispensaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  phone TEXT,
  website TEXT,
  image_url TEXT,
  has_hai_products BOOLEAN DEFAULT false,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Make sure RLS is enabled
ALTER TABLE public.dispensaries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read access to dispensaries" ON public.dispensaries;
DROP POLICY IF EXISTS "Allow authenticated users to manage dispensaries" ON public.dispensaries;

-- Create new policies with proper permissions
CREATE POLICY "Allow anonymous read access to dispensaries"
  ON public.dispensaries
  FOR SELECT
  TO anon
  USING (true);

-- Allow any authenticated user to manage dispensaries (not just the owner)
CREATE POLICY "Allow authenticated users to manage dispensaries"
  ON public.dispensaries
  FOR ALL
  TO authenticated
  USING (true);

-- Create storage bucket if it doesn't exist
DO $$
BEGIN
  -- Check if the bucket exists
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'dispensary-images'
  ) THEN
    -- Create the bucket
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('dispensary-images', 'dispensary-images', true);
    
    -- Set bucket policies
    INSERT INTO storage.policies (name, bucket_id, definition)
    VALUES 
      ('Public Read', 'dispensary-images', '{"roleName":"anon","allowedOperations":["SELECT"]}'),
      ('Auth Upload', 'dispensary-images', '{"roleName":"authenticated","allowedOperations":["SELECT","INSERT","UPDATE","DELETE"]}');
  END IF;
END $$;
