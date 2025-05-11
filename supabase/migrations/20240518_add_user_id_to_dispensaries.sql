-- Add user_id column to dispensaries table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'dispensaries'
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.dispensaries ADD COLUMN user_id UUID;
    END IF;
END $$;

-- Update RLS policies to ensure they work without requiring user_id
DROP POLICY IF EXISTS "Allow authenticated users to manage dispensaries" ON public.dispensaries;

-- Create new policy that doesn't depend on user_id
CREATE POLICY "Allow authenticated users to manage dispensaries"
  ON public.dispensaries
  FOR ALL
  TO authenticated
  USING (true);
