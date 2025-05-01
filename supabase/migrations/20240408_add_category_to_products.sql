-- Add category column to products table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products'
        AND column_name = 'category'
    ) THEN
        ALTER TABLE products
        ADD COLUMN category TEXT CHECK (category IN ('Indica', 'Sativa', 'Hybrid'));
        
        -- Update existing products with random categories
        UPDATE products
        SET category = (
            CASE floor(random() * 3)
                WHEN 0 THEN 'Indica'
                WHEN 1 THEN 'Sativa'
                ELSE 'Hybrid'
            END
        );
        
        -- Add index for faster filtering by category
        CREATE INDEX idx_products_category ON products(category);
    END IF;
END
$$;
