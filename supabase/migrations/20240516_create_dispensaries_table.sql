-- Create dispensaries table if it doesn't exist
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.dispensaries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access to dispensaries"
  ON public.dispensaries
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users to manage dispensaries"
  ON public.dispensaries
  USING (auth.role() = 'authenticated');

-- Add some sample data if the table is empty
INSERT INTO public.dispensaries (name, address, city, lat, lng, phone, website, image_url, has_hai_products)
SELECT 
  'Manhattan Dispensary', 
  '123 Broadway', 
  'New York', 
  40.7128, 
  -74.006, 
  '212-555-1234', 
  'https://example.com', 
  '/placeholder.svg?height=150&width=150', 
  true
WHERE NOT EXISTS (SELECT 1 FROM public.dispensaries LIMIT 1);

INSERT INTO public.dispensaries (name, address, city, lat, lng, phone, image_url, has_hai_products)
SELECT 
  'Brooklyn Heights Cannabis', 
  '456 Atlantic Ave', 
  'Brooklyn', 
  40.6782, 
  -73.9442, 
  '718-555-5678', 
  '/placeholder.svg?height=150&width=150', 
  true
WHERE NOT EXISTS (SELECT 1 FROM public.dispensaries LIMIT 1);

INSERT INTO public.dispensaries (name, address, city, lat, lng, website, image_url, has_hai_products)
SELECT 
  'Buffalo Dispensary', 
  '789 Main St', 
  'Buffalo', 
  42.8864, 
  -78.8784, 
  'https://example.com/buffalo', 
  '/placeholder.svg?height=150&width=150', 
  false
WHERE NOT EXISTS (SELECT 1 FROM public.dispensaries LIMIT 1);

INSERT INTO public.dispensaries (name, address, city, lat, lng, phone, image_url, has_hai_products)
SELECT 
  'Albany Cannabis Co', 
  '101 State St', 
  'Albany', 
  42.6526, 
  -73.7562, 
  '518-555-9012', 
  '/placeholder.svg?height=150&width=150', 
  true
WHERE NOT EXISTS (SELECT 1 FROM public.dispensaries LIMIT 1);

INSERT INTO public.dispensaries (name, address, city, lat, lng, phone, website, image_url, has_hai_products)
SELECT 
  'Rochester Wellness', 
  '202 Park Ave', 
  'Rochester', 
  43.1566, 
  -77.6088, 
  '585-555-3456', 
  'https://example.com/rochester', 
  '/placeholder.svg?height=150&width=150', 
  false
WHERE NOT EXISTS (SELECT 1 FROM public.dispensaries LIMIT 1);
