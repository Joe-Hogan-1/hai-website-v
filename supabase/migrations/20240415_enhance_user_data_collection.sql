-- Enhance the user_data table with more detailed information
ALTER TABLE IF EXISTS user_data 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS first_seen_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_session_time INTEGER DEFAULT 0;

-- Enhance the page_views table with more detailed information
ALTER TABLE IF EXISTS page_views
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS time_on_page INTEGER,
ADD COLUMN IF NOT EXISTS scroll_depth INTEGER,
ADD COLUMN IF NOT EXISTS exit_page BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS utm_term TEXT,
ADD COLUMN IF NOT EXISTS utm_content TEXT,
ADD COLUMN IF NOT EXISTS device_info JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS geo_info JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS referrer_info JSONB DEFAULT '{}'::jsonb;

-- Create a new table for tracking user interactions
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

-- Create a new table for tracking product interactions
CREATE TABLE IF NOT EXISTS product_interactions (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  product_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL, -- view, click, add_to_wishlist, etc.
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  interaction_data JSONB DEFAULT '{}'::jsonb -- additional data about the interaction
);

-- Create a new table for tracking content engagement
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_session_id ON user_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_product_interactions_user_id ON product_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_product_interactions_product_id ON product_interactions(product_id);
CREATE INDEX IF NOT EXISTS idx_content_engagement_user_id ON content_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_content_engagement_content_id ON content_engagement(content_id);

-- Enable RLS on new tables
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_engagement ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can read all user interactions"
  ON user_interactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read all product interactions"
  ON product_interactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read all content engagement"
  ON content_engagement FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for anonymous users
CREATE POLICY "Anonymous users can insert user interactions"
  ON user_interactions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous users can insert product interactions"
  ON product_interactions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous users can insert content engagement"
  ON content_engagement FOR INSERT
  TO anon
  WITH CHECK (true);
