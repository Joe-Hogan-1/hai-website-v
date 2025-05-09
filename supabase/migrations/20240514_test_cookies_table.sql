-- Test query to verify the cookies table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'cookies'
    ) THEN
        RAISE NOTICE 'Cookies table exists!';
    ELSE
        RAISE EXCEPTION 'Cookies table does not exist!';
    END IF;
END $$;

-- Test inserting a sample cookie
INSERT INTO public.cookies (
    cookie_name,
    cookie_value,
    cookie_type,
    consent_status
)
VALUES (
    'test_cookie',
    'test_value',
    'essential',
    TRUE
)
RETURNING id;
