-- Create the storage bucket for secondary grid images
INSERT INTO storage.buckets (id, name, public)
VALUES ('secondary-grid-images', 'secondary-grid-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up access policies for the bucket
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'secondary-grid-images');

CREATE POLICY "Authenticated Users Can Upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'secondary-grid-images');

CREATE POLICY "Owners Can Update and Delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'secondary-grid-images');

CREATE POLICY "Owners Can Update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'secondary-grid-images');
