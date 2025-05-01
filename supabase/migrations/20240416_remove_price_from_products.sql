-- Remove the price column from the products table
ALTER TABLE IF EXISTS products 
DROP COLUMN IF EXISTS price;
