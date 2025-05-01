-- Create a table for product categories
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO product_categories (name, is_active, display_order)
VALUES 
  ('Flower', true, 1),
  ('Pre-Rolls', true, 2),
  ('Edibles', true, 3),
  ('Merch', true, 4),
  ('Concentrates', true, 5),
  ('Vapes', true, 6)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow anonymous select access to product_categories" 
  ON product_categories FOR SELECT 
  TO anon 
  USING (true);

CREATE POLICY "Allow authenticated users to manage product_categories" 
  ON product_categories FOR ALL 
  TO authenticated 
  USING (true);
