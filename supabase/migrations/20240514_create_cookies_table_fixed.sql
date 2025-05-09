-- Create cookies table for tracking analytics
CREATE TABLE IF NOT EXISTS public.cookies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    session_id TEXT,
    cookie_name TEXT NOT NULL,
    cookie_value TEXT,
    cookie_type TEXT NOT NULL CHECK (cookie_type IN ('essential', 'analytics', 'marketing', 'preferences')),
    consent_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    ip_hash TEXT,
    country TEXT,
    region TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    consent_version TEXT,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS cookies_user_id_idx ON public.cookies(user_id);
CREATE INDEX IF NOT EXISTS cookies_session_id_idx ON public.cookies(session_id);
CREATE INDEX IF NOT EXISTS cookies_cookie_type_idx ON public.cookies(cookie_type);
CREATE INDEX IF NOT EXISTS cookies_created_at_idx ON public.cookies(created_at);
CREATE INDEX IF NOT EXISTS cookies_consent_status_idx ON public.cookies(consent_status);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_cookies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_cookies_updated_at ON public.cookies;
CREATE TRIGGER update_cookies_updated_at
BEFORE UPDATE ON public.cookies
FOR EACH ROW
EXECUTE FUNCTION public.update_cookies_updated_at();

-- Add RLS policies
ALTER TABLE public.cookies ENABLE ROW LEVEL SECURITY;

-- Create a function to check if a user is an admin
-- This avoids direct dependency on admin_users table
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin_user BOOLEAN;
BEGIN
    -- First check if admin_users table exists
    IF EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'admin_users'
    ) THEN
        -- If it exists, check if user is admin in that table
        EXECUTE 'SELECT EXISTS(SELECT 1 FROM public.admin_users WHERE user_id = $1 AND is_admin = TRUE)'
        INTO is_admin_user
        USING uid;
        RETURN is_admin_user;
    ELSE
        -- Fallback: Check if user is in a list of admin emails
        -- This assumes auth.users table exists (standard in Supabase)
        RETURN EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = uid
            AND email IN (
                -- Add your admin emails here
                'admin@example.com',
                'admin@yourcompany.com'
                -- You can add more admin emails as needed
            )
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy for selecting cookies (admins can see all, users can only see their own)
DROP POLICY IF EXISTS "Admins can view all cookies" ON public.cookies;
CREATE POLICY "Admins can view all cookies"
ON public.cookies
FOR SELECT
TO authenticated
USING (
    public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Users can view their own cookies" ON public.cookies;
CREATE POLICY "Users can view their own cookies"
ON public.cookies
FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
);

-- Policy for inserting cookies
DROP POLICY IF EXISTS "Anyone can insert cookies" ON public.cookies;
CREATE POLICY "Anyone can insert cookies"
ON public.cookies
FOR INSERT
TO anon, authenticated
WITH CHECK (TRUE);

-- Policy for updating cookies
DROP POLICY IF EXISTS "Admins can update all cookies" ON public.cookies;
CREATE POLICY "Admins can update all cookies"
ON public.cookies
FOR UPDATE
TO authenticated
USING (
    public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Users can update their own cookies" ON public.cookies;
CREATE POLICY "Users can update their own cookies"
ON public.cookies
FOR UPDATE
TO authenticated
USING (
    auth.uid() = user_id
);

-- Policy for deleting cookies (soft delete only)
DROP POLICY IF EXISTS "No one can delete cookies" ON public.cookies;
CREATE POLICY "No one can delete cookies"
ON public.cookies
FOR DELETE
TO authenticated
USING (FALSE);

-- Create a function to get anonymized cookie statistics
CREATE OR REPLACE FUNCTION public.get_cookie_statistics()
RETURNS TABLE (
    cookie_type TEXT,
    consent_count BIGINT,
    total_count BIGINT,
    consent_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.cookie_type,
        COUNT(*) FILTER (WHERE c.consent_status = TRUE) AS consent_count,
        COUNT(*) AS total_count,
        ROUND((COUNT(*) FILTER (WHERE c.consent_status = TRUE)::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0)) * 100, 2) AS consent_rate
    FROM public.cookies c
    WHERE c.is_deleted = FALSE
    GROUP BY c.cookie_type
    ORDER BY c.cookie_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to anonymize old cookie data
CREATE OR REPLACE FUNCTION public.anonymize_old_cookies()
RETURNS void AS $$
BEGIN
    -- Anonymize cookies older than 1 year
    UPDATE public.cookies
    SET 
        ip_hash = NULL,
        user_id = NULL,
        session_id = NULL,
        is_deleted = TRUE
    WHERE created_at < NOW() - INTERVAL '1 year'
    AND is_deleted = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.cookies TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
