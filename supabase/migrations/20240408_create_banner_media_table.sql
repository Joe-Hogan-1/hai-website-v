-- Create a function to create the banner_media table if it doesn't exist
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
      USING (user_id = auth.uid());
      
    CREATE POLICY "Allow authenticated users to delete their own media" 
      ON public.banner_media FOR DELETE 
      TO authenticated 
      USING (user_id = auth.uid());
  END IF;
END;
$$;
