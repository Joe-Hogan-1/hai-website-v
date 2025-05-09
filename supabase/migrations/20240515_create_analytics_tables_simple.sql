-- Create user_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  first_seen_at TIMESTAMP WITH TIME ZONE,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  visit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create page_views table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  session_id TEXT,
  path TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  referrer TEXT,
  time_on_page INTEGER,
  scroll_depth INTEGER,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  device_info JSONB DEFAULT '{}'::jsonb,
  geo_info JSONB DEFAULT '{}'::jsonb,
  referrer_info JSONB DEFAULT '{}'::jsonb
);

-- Create age_verifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.age_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  session_id TEXT,
  verified BOOLEAN,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_agent TEXT,
  device_info JSONB DEFAULT '{}'::jsonb
);

-- Create user_interactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  session_id TEXT,
  page_path TEXT,
  interaction_type TEXT,
  element_id TEXT,
  element_type TEXT,
  interaction_data JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product_interactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.product_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  session_id TEXT,
  product_id TEXT,
  interaction_type TEXT,
  interaction_data JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content_engagement table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.content_engagement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  session_id TEXT,
  content_id TEXT,
  content_type TEXT,
  engagement_type TEXT,
  engagement_time INTEGER,
  engagement_data JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable row level security on all tables
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.age_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_engagement ENABLE ROW LEVEL SECURITY;

-- Create policies to allow anonymous inserts
DO $$
BEGIN
  -- user_data policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_data' AND policyname = 'Allow anonymous inserts') THEN
    CREATE POLICY "Allow anonymous inserts" ON public.user_data FOR INSERT TO anon WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_data' AND policyname = 'Allow users to update own data') THEN
    CREATE POLICY "Allow users to update own data" ON public.user_data FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
  
  -- page_views policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'page_views' AND policyname = 'Allow anonymous inserts') THEN
    CREATE POLICY "Allow anonymous inserts" ON public.page_views FOR INSERT TO anon WITH CHECK (true);
  END IF;
  
  -- age_verifications policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'age_verifications' AND policyname = 'Allow anonymous inserts') THEN
    CREATE POLICY "Allow anonymous inserts" ON public.age_verifications FOR INSERT TO anon WITH CHECK (true);
  END IF;
  
  -- user_interactions policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_interactions' AND policyname = 'Allow anonymous inserts') THEN
    CREATE POLICY "Allow anonymous inserts" ON public.user_interactions FOR INSERT TO anon WITH CHECK (true);
  END IF;
  
  -- product_interactions policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_interactions' AND policyname = 'Allow anonymous inserts') THEN
    CREATE POLICY "Allow anonymous inserts" ON public.product_interactions FOR INSERT TO anon WITH CHECK (true);
  END IF;
  
  -- content_engagement policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_engagement' AND policyname = 'Allow anonymous inserts') THEN
    CREATE POLICY "Allow anonymous inserts" ON public.content_engagement FOR INSERT TO anon WITH CHECK (true);
  END IF;
END
$$;
