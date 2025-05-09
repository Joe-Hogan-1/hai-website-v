-- Check if the banner_media table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'banner_media') THEN
        -- Create the banner_media table if it doesn't exist
        CREATE TABLE public.banner_media (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            url TEXT NOT NULL,
            alt_text TEXT,
            page TEXT NOT NULL,
            type TEXT DEFAULT 'image',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add comment to the table
        COMMENT ON TABLE public.banner_media IS 'Stores banner media for different pages';
    ELSE
        -- Check if the type column exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'banner_media' 
            AND column_name = 'type'
        ) THEN
            -- Add the type column if it doesn't exist
            ALTER TABLE public.banner_media ADD COLUMN type TEXT DEFAULT 'image';
        END IF;
    END IF;
END
$$;

-- Create or replace function to get table columns
CREATE OR REPLACE FUNCTION public.get_table_columns(table_name text)
RETURNS TABLE (column_name text, data_type text) AS $$
BEGIN
    RETURN QUERY
    SELECT c.column_name::text, c.data_type::text
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
    AND c.table_name = table_name;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on the banner_media table
ALTER TABLE public.banner_media ENABLE ROW LEVEL SECURITY;

-- Create policies for the banner_media table
DO $$
BEGIN
    -- Check if the policy exists before creating it
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'banner_media' 
        AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" 
        ON public.banner_media
        FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'banner_media' 
        AND policyname = 'Enable insert for authenticated users only'
    ) THEN
        CREATE POLICY "Enable insert for authenticated users only" 
        ON public.banner_media
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'banner_media' 
        AND policyname = 'Enable update for authenticated users only'
    ) THEN
        CREATE POLICY "Enable update for authenticated users only" 
        ON public.banner_media
        FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'banner_media' 
        AND policyname = 'Enable delete for authenticated users only'
    ) THEN
        CREATE POLICY "Enable delete for authenticated users only" 
        ON public.banner_media
        FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END
$$;
