-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  category TEXT CHECK (category IN ('Indica', 'Sativa', 'Hybrid') OR category IS NULL),
  product_category TEXT CHECK (product_category IN ('Flower', 'Pre-Rolls', 'Edibles', 'Merch', 'Concentrates', 'Vapes') OR product_category IS NULL),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS products_user_id_idx ON public.products(user_id);
CREATE INDEX IF NOT EXISTS products_featured_idx ON public.products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS products_product_category_idx ON public.products(product_category) WHERE product_category IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for row-level security
-- Allow authenticated users to view all products
CREATE POLICY "Anyone can view products" 
  ON public.products 
  FOR SELECT 
  USING (true);

-- Allow authenticated users to insert their own products
CREATE POLICY "Authenticated users can insert their own products" 
  ON public.products 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own products
CREATE POLICY "Users can update their own products" 
  ON public.products 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own products
CREATE POLICY "Users can delete their own products" 
  ON public.products 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions to authenticated and anon users
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
-- Removed the line: GRANT USAGE ON SEQUENCE public.products_id_seq TO authenticated;

-- Insert sample products (optional)
INSERT INTO public.products (name, description, image_url, featured, category, product_category, user_id)
VALUES 
  ('Blue Dream', 'A sativa-dominant hybrid originating from California, known for its balanced full-body relaxation with gentle cerebral invigoration.', 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?q=80&w=1000', true, 'Hybrid', 'Flower', (SELECT id FROM auth.users LIMIT 1)),
  ('OG Kush Pre-Roll', 'Our signature OG Kush strain in a convenient pre-rolled format. Perfect for on-the-go enjoyment.', 'https://images.unsplash.com/photo-1595189592930-831489a68ac2?q=80&w=1000', false, 'Indica', 'Pre-Rolls', (SELECT id FROM auth.users LIMIT 1)),
  ('Citrus Gummies', 'Delicious citrus-flavored edibles made with premium ingredients and precise dosing.', 'https://images.unsplash.com/photo-1620656798579-1984d9e87df7?q=80&w=1000', true, null, 'Edibles', (SELECT id FROM auth.users LIMIT 1)),
  ('HAI Logo T-Shirt', 'Premium cotton t-shirt featuring our iconic HAI logo. Available in multiple sizes.', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000', false, null, 'Merch', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;

-- Create storage bucket for product images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policy to allow authenticated users to upload images
CREATE POLICY "Anyone can view product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Users can update their own product images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);
