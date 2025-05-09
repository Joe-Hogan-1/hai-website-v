-- Create blog_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  slug TEXT,
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can read all blog posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update their own blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can delete their own blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for anonymous users (can only read published posts)
CREATE POLICY "Anonymous users can read published blog posts"
  ON blog_posts FOR SELECT
  TO anon
  USING (published = true);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on blog_posts table
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate a slug from the title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Convert to lowercase
  slug := LOWER(title);
  
  -- Replace spaces with hyphens
  slug := REGEXP_REPLACE(slug, '\s+', '-', 'g');
  
  -- Remove special characters
  slug := REGEXP_REPLACE(slug, '[^a-z0-9\-]', '', 'g');
  
  -- Remove multiple consecutive hyphens
  slug := REGEXP_REPLACE(slug, '\-+', '-', 'g');
  
  -- Trim hyphens from beginning and end
  slug := TRIM(BOTH '-' FROM slug);
  
  RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate slug if not provided
CREATE OR REPLACE FUNCTION set_blog_post_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- If slug is NULL or empty, generate from title
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on blog_posts table
DROP TRIGGER IF EXISTS set_blog_post_slug_trigger ON blog_posts;
CREATE TRIGGER set_blog_post_slug_trigger
BEFORE INSERT OR UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION set_blog_post_slug();

-- Create blog-images bucket directly with public access
DO $$
DECLARE
  bucket_id TEXT := 'blog-images';
BEGIN
  -- Create the bucket if it doesn't exist
  BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES (bucket_id, bucket_id, true)
    ON CONFLICT (id) DO UPDATE SET public = true;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Error creating bucket: %', SQLERRM;
  END;
END $$;

-- Create direct storage policies for blog-images bucket
-- First, drop any existing policies with these names to avoid conflicts
DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update own blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete own blog images" ON storage.objects;

-- Create public access policy
CREATE POLICY "Public can view blog images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- Create upload policy for authenticated users
CREATE POLICY "Authenticated can upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- Create update policy for authenticated users (with proper type casting)
CREATE POLICY "Authenticated can update own blog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images' AND owner = auth.uid()::text);

-- Create delete policy for authenticated users (with proper type casting)
CREATE POLICY "Authenticated can delete own blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images' AND owner = auth.uid()::text);
