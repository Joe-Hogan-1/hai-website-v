-- Add category column to products table
ALTER TABLE products ADD COLUMN category TEXT CHECK (category IN ('Indica', 'Sativa', 'Hybrid'));

-- Update existing products with random categories (for demonstration)
UPDATE products 
SET category = (
  CASE floor(random() * 3)
    WHEN 0 THEN 'Indica'
    WHEN 1 THEN 'Sativa'
    ELSE 'Hybrid'
  END
)
WHERE category IS NULL;

-- Add an index for faster filtering by category
CREATE INDEX idx_products_category ON products(category);
