-- This migration enhances the blog publishing functionality

-- First, ensure the published column exists (it should already exist from previous migrations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'blog_posts' AND column_name = 'published'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN published BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create an index on the published column for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);

-- Update RLS policies to properly handle published/unpublished posts

-- Drop existing policies for anonymous users if they exist
DROP POLICY IF EXISTS "Anonymous users can read published blog posts" ON blog_posts;

-- Recreate the policy for anonymous users (can only read published posts)
CREATE POLICY "Anonymous users can read published blog posts"
  ON blog_posts FOR SELECT
  TO anon
  USING (published = true);

-- Drop existing policies for authenticated users if they exist
DROP POLICY IF EXISTS "Authenticated users can read all blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can read their own unpublished posts" ON blog_posts;

-- Create policies for authenticated users
-- 1. Authenticated users can read all published posts
CREATE POLICY "Authenticated users can read all published posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (published = true);

-- 2. Authenticated users can read their own unpublished posts
CREATE POLICY "Authenticated users can read their own unpublished posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (published = false AND user_id = auth.uid());

-- 3. Admin users can read all posts (published or unpublished)
-- Note: This assumes you have a way to identify admin users, such as a role column in the users table
-- If you don't have this yet, you can implement it later

-- Create a function to toggle the published status
CREATE OR REPLACE FUNCTION toggle_blog_post_published(post_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_published BOOLEAN;
  post_user_id UUID;
  requesting_user_id UUID := auth.uid();
BEGIN
  -- Get the current published status and user_id of the post
  SELECT published, user_id INTO current_published, post_user_id
  FROM blog_posts
  WHERE id = post_id;
  
  -- Check if the requesting user is the owner of the post
  IF post_user_id = requesting_user_id THEN
    -- Toggle the published status
    UPDATE blog_posts
    SET 
      published = NOT current_published,
      updated_at = NOW()
    WHERE id = post_id;
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

-- Create a function to get published posts (for public viewing)
CREATE OR REPLACE FUNCTION get_published_blog_posts(limit_count INTEGER DEFAULT 10, offset_count INTEGER DEFAULT 0)
RETURNS SETOF blog_posts
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM blog_posts
  WHERE published = true
  ORDER BY created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
$$;

-- Create a function to get all posts for the authenticated user (including unpublished)
CREATE OR REPLACE FUNCTION get_user_blog_posts(limit_count INTEGER DEFAULT 10, offset_count INTEGER DEFAULT 0)
RETURNS SETOF blog_posts
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM blog_posts
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
$$;

-- Add a trigger to track when posts are published
CREATE OR REPLACE FUNCTION track_blog_post_publishing()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If the post is being published for the first time
  IF NEW.published = true AND OLD.published = false THEN
    -- You could add additional logic here, such as:
    -- - Recording the first publish date
    -- - Sending notifications
    -- - Updating related tables
    
    -- For now, we'll just update the updated_at timestamp
    NEW.updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS blog_post_publishing_trigger ON blog_posts;
CREATE TRIGGER blog_post_publishing_trigger
BEFORE UPDATE ON blog_posts
FOR EACH ROW
WHEN (OLD.published IS DISTINCT FROM NEW.published)
EXECUTE FUNCTION track_blog_post_publishing();
