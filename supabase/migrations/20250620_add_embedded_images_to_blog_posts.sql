ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS embedded_image_url_1 TEXT,
ADD COLUMN IF NOT EXISTS embedded_image_url_2 TEXT,
ADD COLUMN IF NOT EXISTS embedded_image_url_3 TEXT;

-- Ensure RLS policies still cover these if needed,
-- but typically SELECT/UPDATE/INSERT on the row is sufficient.
-- Storage policies for 'blog-images' bucket should already cover these new image paths
-- if they follow the same naming convention or are stored in the same bucket.

-- No changes needed to existing RLS policies for blog_posts table itself,
-- as they operate on rows, not specific columns for read/write access.
-- Storage policies for 'blog-images' bucket will apply to new images uploaded there.
