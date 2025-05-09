-- Complete Database Setup for Hai Website
-- This file consolidates all migrations into a single script that can recreate the entire database

-- =============================================
-- EXTENSIONS
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USER DATA TABLES
-- =============================================

-- User Data Table
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

-- Page Views Table
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

-- Age Verifications Table
CREATE TABLE IF NOT EXISTS age_verifications (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  verified BOOLEAN NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT
);

-- User Interactions Table
CREATE TABLE IF NOT EXISTS user_interactions (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  page_path TEXT NOT NULL,
  interaction_type TEXT NOT NULL, -- click, scroll, form_submit, video_play, etc.
  element_id TEXT, -- ID of the element interacted with
  element_type TEXT, -- type of element (button, link, form, video, etc.)
  interaction_data JSONB DEFAULT '{}'::jsonb, -- additional data about the interaction
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CONTENT TABLES
-- =============================================

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Banner Media Table
CREATE TABLE IF NOT EXISTS banner_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  text_overlay JSONB,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Banner Videos Table
CREATE TABLE IF NOT EXISTS banner_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  text_overlay JSONB,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grid Images Table
CREATE TABLE IF NOT EXISTS grid_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  position INTEGER NOT NULL,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Breaking News Table
CREATE TABLE IF NOT EXISTS breaking_news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  link TEXT,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID
);

-- =============================================
-- PRODUCT TABLES
-- =============================================

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT CHECK (category IN ('Indica', 'Sativa', 'Hybrid')),
  product_category TEXT CHECK (product_category IN ('Flower', 'Pre-Rolls', 'Edibles', 'Merch', 'Concentrates', 'Vapes')),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Categories Table
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Interactions Table
CREATE TABLE IF NOT EXISTS product_interactions (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  product_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL, -- view, click, add_to_wishlist, etc.
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  interaction_data JSONB DEFAULT '{}'::jsonb -- additional data about the interaction
);

-- =============================================
-- CONTENT ENGAGEMENT TABLES
-- =============================================

-- Content Engagement Table
CREATE TABLE IF NOT EXISTS content_engagement (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL, -- blog, video, etc.
  engagement_type TEXT NOT NULL, -- view, read, share, etc.
  engagement_time INTEGER, -- time spent engaging with content in seconds
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  engagement_data JSONB DEFAULT '{}'::jsonb -- additional data about the engagement
);

-- =============================================
-- INDEXES
-- =============================================

-- User Data Indexes
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);

-- Page Views Indexes
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);

-- Age Verifications Indexes
CREATE INDEX IF NOT EXISTS idx_age_verifications_user_id ON age_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_age_verifications_timestamp ON age_verifications(timestamp);

-- Newsletter Subscribers Indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_created_at ON newsletter_subscribers(created_at);

-- Banner Media Indexes
CREATE INDEX IF NOT EXISTS idx_banner_media_user_id ON banner_media(user_id);
CREATE INDEX IF NOT EXISTS idx_banner_media_created_at ON banner_media(created_at);

-- Grid Images Indexes
CREATE INDEX IF NOT EXISTS idx_grid_images_position ON grid_images(position);
CREATE INDEX IF NOT EXISTS idx_grid_images_user_id ON grid_images(user_id);

-- Products Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_product_category ON products(product_category);

-- User Interactions Indexes
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_session_id ON user_interactions(session_id);

-- Product Interactions Indexes
CREATE INDEX IF NOT EXISTS idx_product_interactions_user_id ON product_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_product_interactions_product_id ON product_interactions(product_id);

-- Content Engagement Indexes
CREATE INDEX IF NOT EXISTS idx_content_engagement_user_id ON content_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_content_engagement_content_id ON content_engagement(content_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE grid_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaking_news ENABLE ROW LEVEL SECURITY;

-- User Data RLS Policies
CREATE POLICY "Authenticated users can read all user data"
  ON user_data FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anonymous users can insert their own data"
  ON user_data FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous users can update their own data"
  ON user_data FOR UPDATE
  TO anon
  USING (true);

-- Page Views RLS Policies
CREATE POLICY "Authenticated users can read all page views"
  ON page_views FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anonymous users can insert page views"
  ON page_views FOR INSERT
  TO anon
  WITH CHECK (true);

-- Age Verifications RLS Policies
CREATE POLICY "Authenticated users can read all age verifications"
  ON age_verifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anonymous users can insert age verifications"
  ON age_verifications FOR INSERT
  TO anon
  WITH CHECK (true);

-- Newsletter Subscribers RLS Policies
CREATE POLICY "Authenticated users can read all newsletter subscribers"
  ON newsletter_subscribers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete newsletter subscribers"
  ON newsletter_subscribers FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anonymous users can insert newsletter subscribers"
  ON newsletter_subscribers FOR INSERT
  TO anon
  WITH CHECK (true);

-- Banner Media RLS Policies
CREATE POLICY "Allow anonymous select access to banner_media" 
  ON banner_media FOR SELECT 
  TO anon 
  USING (true);

CREATE POLICY "Allow authenticated users to insert banner_media" 
  ON banner_media FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update banner_media" 
  ON banner_media FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to delete banner_media" 
  ON banner_media FOR DELETE 
  TO authenticated 
  USING (true);

-- Banner Videos RLS Policies
CREATE POLICY "Allow anonymous select access to banner_videos" 
  ON banner_videos FOR SELECT 
  TO anon 
  USING (true);

CREATE POLICY "Allow authenticated users to insert banner_videos" 
  ON banner_videos FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update banner_videos" 
  ON banner_videos FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to delete banner_videos" 
  ON banner_videos FOR DELETE 
  TO authenticated 
  USING (true);

-- Grid Images RLS Policies
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

-- Products RLS Policies
CREATE POLICY "Allow anonymous select access to products" 
  ON products FOR SELECT 
  TO anon 
  USING (true);

CREATE POLICY "Allow authenticated users to manage products" 
  ON products FOR ALL 
  TO authenticated 
  USING (true);

-- Product Categories RLS Policies
CREATE POLICY "Allow anonymous select access to product_categories" 
  ON product_categories FOR SELECT 
  TO anon 
  USING (true);

CREATE POLICY "Allow authenticated users to manage product_categories" 
  ON product_categories FOR ALL 
  TO authenticated 
  USING (true);

-- User Interactions RLS Policies
CREATE POLICY "Authenticated users can read all user interactions"
  ON user_interactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anonymous users can insert user interactions"
  ON user_interactions FOR INSERT
  TO anon
  WITH CHECK (true);

-- Product Interactions RLS Policies
CREATE POLICY "Authenticated users can read all product interactions"
  ON product_interactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anonymous users can insert product interactions"
  ON product_interactions FOR INSERT
  TO anon
  WITH CHECK (true);

-- Content Engagement RLS Policies
CREATE POLICY "Authenticated users can read all content engagement"
  ON content_engagement FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anonymous users can insert content engagement"
  ON content_engagement FOR INSERT
  TO anon
  WITH CHECK (true);

-- Breaking News RLS Policies
CREATE POLICY "Allow anonymous select access to breaking_news" 
  ON breaking_news FOR SELECT 
  TO anon 
  USING (true);

CREATE POLICY "Allow authenticated users to insert breaking_news" 
  ON breaking_news FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update breaking_news" 
  ON breaking_news FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow authenticated users to delete breaking_news" 
  ON breaking_news FOR DELETE 
  TO authenticated 
  USING (true);

-- =============================================
-- DEFAULT DATA
-- =============================================

-- Insert default product categories
INSERT INTO product_categories (name, is_active, display_order)
VALUES 
  ('Flower', true, 1),
  ('Pre-Rolls', true, 2),
  ('Edibles', true, 3),
  ('Merch', true, 4),
  ('Concentrates', true, 5),
  ('Vapes', true, 6)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to create banner_media table
CREATE OR REPLACE FUNCTION create_banner_media_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'banner_media'
  ) THEN
    -- Create the banner_media table
    CREATE TABLE public.banner_media (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      description TEXT,
      media_url TEXT,
      media_type TEXT CHECK (media_type IN ('image', 'video')),
      text_overlay JSONB,
      user_id UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes
    CREATE INDEX idx_banner_media_user_id ON public.banner_media(user_id);
    CREATE INDEX idx_banner_media_created_at ON public.banner_media(created_at);
    
    -- Enable RLS
    ALTER TABLE public.banner_media ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Allow anonymous select access" 
      ON public.banner_media FOR SELECT 
      TO anon 
      USING (true);
      
    CREATE POLICY "Allow authenticated users to insert" 
      ON public.banner_media FOR INSERT 
      TO authenticated 
      WITH CHECK (true);
      
    CREATE POLICY "Allow authenticated users to update their own media" 
      ON public.banner_media FOR UPDATE 
      TO authenticated 
      USING (true);
      
    CREATE POLICY "Allow authenticated users to delete their own media" 
      ON public.banner_media FOR DELETE 
      TO authenticated 
      USING (true);
  END IF;
END;
$$;

-- Function to create grid_images table
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

-- Function to create breaking_news table
CREATE OR REPLACE FUNCTION create_breaking_news_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'breaking_news'
  ) THEN
    -- Create the breaking_news table
    CREATE TABLE public.breaking_news (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      message TEXT NOT NULL,
      link TEXT,
      is_active BOOLEAN DEFAULT true,
      start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      end_date TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      user_id UUID
    );
    
    -- Enable RLS
    ALTER TABLE breaking_news ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Allow anonymous select access to breaking_news" 
      ON breaking_news FOR SELECT 
      TO anon 
      USING (true);
      
    CREATE POLICY "Allow authenticated users to insert breaking_news" 
      ON breaking_news FOR INSERT 
      TO authenticated 
      WITH CHECK (true);
      
    CREATE POLICY "Allow authenticated users to update breaking_news" 
      ON breaking_news FOR UPDATE 
      TO authenticated 
      USING (true);
      
    CREATE POLICY "Allow authenticated users to delete breaking_news" 
      ON breaking_news FOR DELETE 
      TO authenticated 
      USING (true);
  END IF;
END;
$$;

-- Execute functions to ensure tables exist
SELECT create_banner_media_table();
SELECT create_grid_images_table();
SELECT create_breaking_news_table();
