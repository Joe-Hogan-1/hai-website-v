CREATE TABLE IF NOT EXISTS secondary_text (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default content
INSERT INTO secondary_text (title, content)
VALUES (
  'Our Philosophy',
  'At hai, we believe in creating products that enhance your everyday experiences. Our carefully crafted items are designed to bring balance and joy to your life, whether you''re starting your day or winding down in the evening.'
);
