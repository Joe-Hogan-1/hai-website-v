-- Create a function to execute arbitrary SQL (for admin use only)
CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO authenticated;

-- Create a function to get table columns
CREATE OR REPLACE FUNCTION public.get_table_columns(table_name text)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_agg(jsonb_build_object(
    'column_name', column_name,
    'data_type', data_type,
    'is_nullable', is_nullable
  ))
  INTO result
  FROM information_schema.columns
  WHERE table_schema = 'public'
  AND table_name = $1;
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_table_columns(text) TO authenticated;
