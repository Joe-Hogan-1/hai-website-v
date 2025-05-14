-- Create a table for storing editable content for the lifestyle page
CREATE TABLE IF NOT EXISTS public.lifestyle_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Add RLS policies
ALTER TABLE public.lifestyle_content ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view content
CREATE POLICY "Allow anyone to view lifestyle content" 
  ON public.lifestyle_content 
  FOR SELECT 
  USING (true);

-- Allow authenticated users to insert their own content
CREATE POLICY "Allow authenticated users to insert their own lifestyle content" 
  ON public.lifestyle_content 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own content
CREATE POLICY "Allow authenticated users to update their own lifestyle content" 
  ON public.lifestyle_content 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own content
CREATE POLICY "Allow authenticated users to delete their own lifestyle content" 
  ON public.lifestyle_content 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);
