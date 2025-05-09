-- Comprehensive database structure fix for Hai Website
-- This migration ensures all tables exist with the correct structure and permissions

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- BLOG POSTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for blog_posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  category TEXT CHECK (category IN ('Indica', 'Sativa', 'Hybrid')),
  product_category TEXT,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for products
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_product_category ON products(product_category);

-- =============================================
-- PRODUCT CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for product_categories
CREATE INDEX IF NOT EXISTS idx_product_categories_display_order ON product_categories(display_order);

-- =============================================
-- DISPENSARIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS dispensaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  phone TEXT,
  website TEXT,
  image_url TEXT,
  has_hai_products BOOLEAN DEFAULT true,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for dispensaries
CREATE INDEX IF NOT EXISTS idx_dispensaries_user_id ON dispensaries(user_id);
CREATE INDEX IF NOT EXISTS idx_dispensaries_city ON dispensaries(city);
CREATE INDEX IF NOT EXISTS idx_dispensaries_has_hai_products ON dispensaries(has_hai_products);

-- =============================================
-- BANNER VIDEOS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS banner_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  position INTEGER,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for banner_videos
CREATE INDEX IF NOT EXISTS idx_banner_videos_user_id ON banner_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_banner_videos_position ON banner_videos(position);

-- =============================================
-- BANNER MEDIA TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS banner_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  text_overlay JSONB,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for banner_media
CREATE INDEX IF NOT EXISTS idx_banner_media_user_id ON banner_media(user_id);
CREATE INDEX IF NOT EXISTS idx_banner_media_media_type ON banner_media(media_type);

-- =============================================
-- GRID IMAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS grid_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  position INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for grid_images
CREATE INDEX IF NOT EXISTS idx_grid_images_user_id ON grid_images(user_id);
CREATE INDEX IF NOT EXISTS idx_grid_images_position ON grid_images(position);

-- =============================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for newsletter_subscribers
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- =============================================
-- BREAKING NEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS breaking_news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  link TEXT,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for breaking_news
CREATE INDEX IF NOT EXISTS idx_breaking_news_user_id ON breaking_news(user_id);
CREATE INDEX IF NOT EXISTS idx_breaking_news_is_active ON breaking_news(is_active);

-- =============================================
-- USER DATA TABLES
-- =============================================
CREATE TABLE IF NOT EXISTS user_data (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  first_seen_at TIMESTAMP WITH TIME ZONE,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  visit_count INTEGER DEFAULT 0,
  total_session_time INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  path TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  referrer TEXT,
  session_id TEXT,
  time_on_page INTEGER,
  scroll_depth INTEGER,
  exit_page BOOLEAN DEFAULT false,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  device_info JSONB DEFAULT '{}'::jsonb,
  geo_info JSONB DEFAULT '{}'::jsonb,
  referrer_info JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS age_verifications (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  verified BOOLEAN NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispensaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE grid_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaking_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_verifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CREATE RLS POLICIES
-- =============================================

-- Blog Posts Policies
DROP POLICY IF EXISTS "Allow anonymous select access to blog_posts" ON blog_posts;
CREATE POLICY "Allow anonymous select access to blog_posts" 
  ON blog_posts FOR SELECT 
  TO anon 
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage blog_posts" ON blog_posts;
CREATE POLICY "Allow authenticated users to manage blog_posts" 
  ON blog_posts FOR ALL 
  TO authenticated 
  USING (true);

-- Products Policies
DROP POLICY IF EXISTS "Allow anonymous select access to products" ON products;
CREATE POLICY "Allow anonymous select access to products" 
  ON products FOR SELECT 
  TO anon 
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage products" ON products;
CREATE POLICY "Allow authenticated users to manage products" 
  ON products FOR ALL 
  TO authenticated 
  USING (true);

-- Product Categories Policies
DROP POLICY IF EXISTS "Allow anonymous select access to product_categories" ON product_categories;
CREATE POLICY "Allow anonymous select access to product_categories" 
  ON product_categories FOR SELECT 
  TO anon 
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage product_categories" ON product_categories;
CREATE POLICY "Allow authenticated users to manage product_categories" 
  ON product_categories FOR ALL 
  TO authenticated 
  USING (true);

-- Dispensaries Policies
DROP POLICY IF EXISTS "Allow anonymous select access to dispensaries" ON dispensaries;
CREATE POLICY "Allow anonymous select access to dispensaries" 
  ON dispensaries FOR SELECT 
  TO anon 
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage dispensaries" ON dispensaries;
CREATE POLICY "Allow authenticated users to manage dispensaries" 
  ON dispensaries FOR ALL 
  TO authenticated 
  USING (true);

-- Banner Videos Policies
DROP POLICY IF EXISTS "Allow anonymous select access to banner_videos" ON banner_videos;
CREATE POLICY "Allow anonymous select access to banner_videos" 
  ON banner_videos FOR SELECT 
  TO anon 
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage banner_videos" ON banner_videos;
CREATE POLICY "Allow authenticated users to manage banner_videos" 
  ON banner_videos FOR ALL 
  TO authenticated 
  USING (true);

-- Banner Media Policies
DROP POLICY IF EXISTS "Allow anonymous select access to banner_media" ON banner_media;
CREATE POLICY "Allow anonymous select access to banner_media" 
  ON banner_media FOR SELECT 
  TO anon 
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage banner_media" ON banner_media;
CREATE POLICY "Allow authenticated users to manage banner_media" 
  ON banner_media FOR ALL 
  TO authenticated 
  USING (true);

-- Grid Images Policies
DROP POLICY IF EXISTS "Allow anonymous select access to grid_images" ON grid_images;
CREATE POLICY "Allow anonymous select access to grid_images" 
  ON grid_images FOR SELECT 
  TO anon 
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage grid_images" ON grid_images;
CREATE POLICY "Allow authenticated users to manage grid_images" 
  ON grid_images FOR ALL 
  TO authenticated 
  USING (true);

-- Newsletter Subscribers Policies
DROP POLICY IF EXISTS "Allow anonymous select access to newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "Allow anonymous select access to newsletter_subscribers" 
  ON newsletter_subscribers FOR SELECT 
  TO anon 
  USING (true);

DROP POLICY IF EXISTS "Allow anonymous insert access to newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "Allow anonymous insert access to newsletter_subscribers" 
  ON newsletter_subscribers FOR INSERT 
  TO anon 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "Allow authenticated users to manage newsletter_subscribers" 
  ON newsletter_subscribers FOR ALL 
  TO authenticated 
  USING (true);

-- Breaking News Policies
DROP POLICY IF EXISTS "Allow anonymous select access to breaking_news" ON breaking_news;
CREATE POLICY "Allow anonymous select access to breaking_news" 
  ON breaking_news FOR SELECT 
  TO anon 
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage breaking_news" ON breaking_news;
CREATE POLICY "Allow authenticated users to manage breaking_news" 
  ON breaking_news FOR ALL 
  TO authenticated 
  USING (true);

-- User Data Policies
DROP POLICY IF EXISTS "Allow anonymous select access to user_data" ON user_data;
CREATE POLICY "Allow anonymous select access to user_data" 
  ON user_data FOR SELECT 
  TO anon 
  USING (true);

DROP POLICY IF EXISTS "Allow anonymous insert access to user_data" ON user_data;
CREATE POLICY "Allow anonymous insert access to user_data" 
  ON user_data FOR INSERT 
  TO anon 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous update access to user_data" ON user_data;
CREATE POLICY "Allow anonymous update access to user_data" 
  ON user_data FOR UPDATE 
  TO anon 
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage user_data" ON user_data;
CREATE POLICY "Allow authenticated users to manage user_data" 
  ON user_data FOR ALL 
  TO authenticated 
  USING (true);

-- Page Views Policies
DROP POLICY IF EXISTS "Allow anonymous insert access to page_views" ON page_views;
CREATE POLICY "Allow anonymous insert access to page_views" 
  ON page_views FOR INSERT 
  TO anon 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to select page_views" ON page_views;
CREATE POLICY "Allow authenticated users to select page_views" 
  ON page_views FOR SELECT 
  TO authenticated 
  USING (true);

-- Age Verifications Policies
DROP POLICY IF EXISTS "Allow anonymous insert access to age_verifications" ON age_verifications;
CREATE POLICY "Allow anonymous insert access to age_verifications" 
  ON age_verifications FOR INSERT 
  TO anon 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to select age_verifications" ON age_verifications;
CREATE POLICY "Allow authenticated users to select age_verifications" 
  ON age_verifications FOR SELECT 
  TO authenticated 
  USING (true);

-- =============================================
-- INSERT DEFAULT DATA
-- =============================================

-- Insert default product categories if they don't exist
INSERT INTO product_categories (name, is_active, display_order)
VALUES 
  ('Flower', true, 1),
  ('Pre-Rolls', true, 2),
  ('Edibles', true, 3),
  ('Merch', true, 4),
  ('Concentrates', true, 5),
  ('Vapes', true, 6)
ON CONFLICT (name) DO NOTHING;
