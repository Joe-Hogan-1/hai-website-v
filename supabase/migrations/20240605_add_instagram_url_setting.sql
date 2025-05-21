-- Add Instagram URL setting if it doesn't exist
INSERT INTO site_settings (key, value)
SELECT 'instagram_url', to_json('https://instagram.com')
WHERE NOT EXISTS (
    SELECT 1 FROM site_settings WHERE key = 'instagram_url'
);
