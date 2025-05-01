-- Remove the thc_percentage column from the products table
ALTER TABLE IF EXISTS products 
DROP COLUMN IF EXISTS thc_percentage;
