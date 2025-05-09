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

-- Create function to ensure blog-images bucket exists with proper permissions
CREATE OR REPLACE FUNCTION create_blog_images_bucket()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bucket_id TEXT := 'blog-images';
BEGIN
  -- Create the bucket if it doesn't exist
  BEGIN
    INSERT INTO storage.buckets (id, name)
    VALUES (bucket_id, bucket_id)
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN 'Error creating bucket: ' || SQLERRM;
  END;

  -- Create policies for the bucket
  BEGIN
    -- Drop existing policies to avoid conflicts
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload blog images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can update own blog images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can delete own blog images" ON storage.objects;
    DROP POLICY IF EXISTS "Anonymous users can view blog images" ON storage.objects;
    
    -- Create new policies
    -- Allow public access to blog images
    CREATE POLICY "Anonymous users can view blog images"
      ON storage.objects FOR SELECT
      TO anon
      USING (bucket_id = 'blog-images');
    
    -- Allow authenticated users to upload blog images
    CREATE POLICY "Authenticated users can upload blog images"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'blog-images');
    
    -- Allow authenticated users to update their own blog images
    CREATE POLICY "Authenticated users can update own blog images"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'blog-images' AND auth.uid()::text = owner);
    
    -- Allow authenticated users to delete their own blog images
    CREATE POLICY "Authenticated users can delete own blog images"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'blog-images' AND auth.uid()::text = owner);
  EXCEPTION
    WHEN OTHERS THEN
      RETURN 'Error creating policies: ' || SQLERRM;
  END;

  RETURN 'Blog images bucket and policies created successfully';
END;
$$;

-- Execute the function to ensure the bucket exists
SELECT create_blog_images_bucket();

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

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_post_categories junction table
CREATE TABLE IF NOT EXISTS blog_post_categories (
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_post_id, category_id)
);

-- Enable RLS on these tables
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_categories
CREATE POLICY "Anyone can read blog categories"
  ON blog_categories FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can manage blog categories"
  ON blog_categories FOR ALL
  TO authenticated
  USING (true);

-- Create policies for blog_post_categories
CREATE POLICY "Anyone can read blog post categories"
  ON blog_post_categories FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can manage blog post categories"
  ON blog_post_categories FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for the junction table
CREATE INDEX IF NOT EXISTS idx_blog_post_categories_blog_post_id ON blog_post_categories(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_categories_category_id ON blog_post_categories(category_id);

-- Insert some default categories
INSERT INTO blog_categories (name, description)
VALUES 
  ('News', 'Latest news and updates'),
  ('Lifestyle', 'Cannabis lifestyle and culture'),
  ('Education', 'Educational content about cannabis'),
  ('Products', 'Information about our products')
ON CONFLICT (name) DO NOTHING;

-- Create blog_comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID,
  name TEXT,
  email TEXT,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on blog_comments
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_comments
CREATE POLICY "Anyone can read approved blog comments"
  ON blog_comments FOR SELECT
  TO anon
  USING (approved = true);

CREATE POLICY "Anonymous users can insert blog comments"
  ON blog_comments FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read all blog comments"
  ON blog_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage blog comments"
  ON blog_comments FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for blog_comments
CREATE INDEX IF NOT EXISTS idx_blog_comments_blog_post_id ON blog_comments(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user_id ON blog_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_approved ON blog_comments(approved);

-- Create trigger for updated_at on blog_comments
DROP TRIGGER IF EXISTS update_blog_comments_updated_at ON blog_comments;
CREATE TRIGGER update_blog_comments_updated_at
BEFORE UPDATE ON blog_comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updated_at on blog_categories
DROP TRIGGER IF EXISTS update_blog_categories_updated_at ON blog_categories;
CREATE TRIGGER update_blog_categories_updated_at
BEFORE UPDATE ON blog_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
