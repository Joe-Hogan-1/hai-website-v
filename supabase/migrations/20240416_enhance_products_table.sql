-- Add new columns to the products table
ALTER TABLE IF EXISTS products 
ADD COLUMN IF NOT EXISTS product_category TEXT CHECK (product_category IN ('Flower', 'Pre-Rolls', 'Edibles', 'Merch', 'Concentrates', 'Vapes')),
ADD COLUMN IF NOT EXISTS thc_percentage NUMERIC CHECK (thc_percentage >= 0 AND thc_percentage <= 100);

-- Update existing products with random categories if they don't have one
UPDATE products
SET product_category = (
    CASE floor(random() * 6)
        WHEN 0 THEN 'Flower'
        WHEN 1 THEN 'Pre-Rolls'
        WHEN 2 THEN 'Edibles'
        WHEN 3 THEN 'Merch'
        WHEN 4 THEN 'Concentrates'
        ELSE 'Vapes'
    END
)
WHERE product_category IS NULL;

-- Add index for faster filtering by category
CREATE INDEX IF NOT EXISTS idx_products_category ON products(product_category);
