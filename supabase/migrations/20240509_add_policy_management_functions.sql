-- Function to remove a policy if it exists
CREATE OR REPLACE FUNCTION remove_policy(
  table_name TEXT,
  schema_name TEXT,
  policy_name TEXT
) RETURNS VOID AS $$
DECLARE
  policy_exists BOOLEAN;
BEGIN
  -- Check if the policy exists
  SELECT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = schema_name
    AND tablename = table_name
    AND policyname = policy_name
  ) INTO policy_exists;
  
  -- Drop the policy if it exists
  IF policy_exists THEN
    EXECUTE format('DROP POLICY IF EXISTS "%s" ON %I.%I', policy_name, schema_name, table_name);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create a policy
CREATE OR REPLACE FUNCTION create_policy(
  table_name TEXT,
  schema_name TEXT,
  policy_name TEXT,
  policy_definition TEXT,
  policy_action TEXT DEFAULT 'ALL',
  policy_role TEXT DEFAULT 'public'
) RETURNS VOID AS $$
BEGIN
  -- Remove the policy if it already exists
  PERFORM remove_policy(table_name, schema_name, policy_name);
  
  -- Create the new policy
  EXECUTE format(
    'CREATE POLICY "%s" ON %I.%I FOR %s TO %s USING (%s)',
    policy_name,
    schema_name,
    table_name,
    policy_action,
    policy_role,
    policy_definition
  );
END;
$$ LANGUAGE plpgsql;

-- Enhanced fix_storage_policies function with backup
CREATE OR REPLACE FUNCTION fix_storage_policies(bucket_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- Remove existing conflicting policies
    PERFORM remove_policy('objects', 'storage', 'Allow public read access to all files');
    PERFORM remove_policy('objects', 'storage', 'Allow authenticated users to upload files');
    PERFORM remove_policy('objects', 'storage', 'Allow authenticated users to update their own files');
    PERFORM remove_policy('objects', 'storage', 'Allow authenticated users to delete their own files');
    
    -- Remove any existing policies specific to this bucket
    PERFORM remove_policy('objects', 'storage', 'Allow public read access to ' || bucket_name);
    PERFORM remove_policy('objects', 'storage', 'Allow authenticated users to upload ' || bucket_name);
    PERFORM remove_policy('objects', 'storage', 'Allow authenticated users to update ' || bucket_name);
    PERFORM remove_policy('objects', 'storage', 'Allow authenticated users to delete ' || bucket_name);

    -- Create new bucket-specific policies
    PERFORM create_policy(
      'objects', 
      'storage', 
      'Allow public read access to ' || bucket_name,
      format('bucket_id = ''%s''', bucket_name),
      'SELECT',
      'public'
    );
    
    PERFORM create_policy(
      'objects', 
      'storage', 
      'Allow authenticated users to upload ' || bucket_name,
      format('bucket_id = ''%s''', bucket_name),
      'INSERT',
      'authenticated'
    );
    
    PERFORM create_policy(
      'objects', 
      'storage', 
      'Allow authenticated users to update ' || bucket_name,
      format('bucket_id = ''%s'' AND (auth.uid() = owner OR auth.uid() IN (SELECT id FROM auth.users WHERE auth.users.role = ''admin''))', bucket_name),
      'UPDATE',
      'authenticated'
    );
    
    PERFORM create_policy(
      'objects', 
      'storage', 
      'Allow authenticated users to delete ' || bucket_name,
      format('bucket_id = ''%s'' AND (auth.uid() = owner OR auth.uid() IN (SELECT id FROM auth.users WHERE auth.users.role = ''admin''))', bucket_name),
      'DELETE',
      'authenticated'
    );
END;
$$ LANGUAGE plpgsql;
