-- Make user_id column nullable if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'dispensaries'
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.dispensaries ALTER COLUMN user_id DROP NOT NULL;
    END IF;
END $$;

-- Update RLS policies for dispensaries table
DROP POLICY IF EXISTS "Allow authenticated users to manage dispensaries" ON public.dispensaries;

-- Create new policy that doesn't depend on user_id
CREATE POLICY "Allow authenticated users to manage dispensaries"
  ON public.dispensaries
  FOR ALL
  TO authenticated
  USING (true);
