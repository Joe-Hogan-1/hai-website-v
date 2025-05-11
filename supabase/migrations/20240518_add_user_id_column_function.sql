-- Create a function to add the user_id column to dispensaries table
CREATE OR REPLACE FUNCTION public.add_user_id_column_to_dispensaries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the column exists
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'dispensaries'
    AND column_name = 'user_id'
  ) THEN
    -- Add the column if it doesn't exist
    EXECUTE 'ALTER TABLE public.dispensaries ADD COLUMN user_id UUID;';
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.add_user_id_column_to_dispensaries() TO authenticated;
