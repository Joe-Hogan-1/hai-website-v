-- Drop existing dispensaries table if it exists
DROP TABLE IF EXISTS public.dispensaries;

-- Create dispensaries table with structure similar to products table
CREATE TABLE public.dispensaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT DEFAULT 'NY',
  zip TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  phone TEXT,
  website TEXT,
  image_url TEXT,
  has_hai_products BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX dispensaries_name_idx ON public.dispensaries(name);
CREATE INDEX dispensaries_city_idx ON public.dispensaries(city);
CREATE INDEX dispensaries_featured_idx ON public.dispensaries(featured) WHERE featured = true;
CREATE INDEX dispensaries_has_hai_products_idx ON public.dispensaries(has_hai_products) WHERE has_hai_products = true;

-- Enable Row Level Security
ALTER TABLE public.dispensaries ENABLE ROW LEVEL SECURITY;

-- Create policies for row-level security
-- Allow anyone to view dispensaries
CREATE POLICY "Anyone can view dispensaries" 
  ON public.dispensaries 
  FOR SELECT 
  USING (true);

-- Allow authenticated users to insert dispensaries
CREATE POLICY "Authenticated users can insert dispensaries" 
  ON public.dispensaries 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Allow authenticated users to update dispensaries
CREATE POLICY "Authenticated users can update dispensaries" 
  ON public.dispensaries 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- Allow authenticated users to delete dispensaries
CREATE POLICY "Authenticated users can delete dispensaries" 
  ON public.dispensaries 
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for dispensaries table
DROP TRIGGER IF EXISTS dispensaries_updated_at ON public.dispensaries;
CREATE TRIGGER dispensaries_updated_at
  BEFORE UPDATE ON public.dispensaries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions to authenticated and anon users
GRANT SELECT ON public.dispensaries TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.dispensaries TO authenticated;

-- Create storage bucket for dispensary images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('dispensary-images', 'dispensary-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy to allow authenticated users to upload images
CREATE POLICY "Anyone can view dispensary images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'dispensary-images');

CREATE POLICY "Authenticated users can upload dispensary images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'dispensary-images');

CREATE POLICY "Authenticated users can update dispensary images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'dispensary-images');

CREATE POLICY "Authenticated users can delete dispensary images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'dispensary-images');
