ALTER TABLE public.product_categories
ADD COLUMN color TEXT DEFAULT '#6B7280';

COMMENT ON COLUMN public.product_categories.color IS 'Hex color code for the category badge.';

-- Backfill existing common categories with some default colors for better initial appearance
UPDATE public.product_categories SET color = '#4ADE80' WHERE name = 'Flower';
UPDATE public.product_categories SET color = '#F97316' WHERE name = 'Pre-Rolls';
UPDATE public.product_categories SET color = '#EC4899' WHERE name = 'Edibles';
UPDATE public.product_categories SET color = '#3B82F6' WHERE name = 'Merch';
UPDATE public.product_categories SET color = '#8B5CF6' WHERE name = 'Concentrates';
UPDATE public.product_categories SET color = '#14B8A6' WHERE name = 'Vapes';

-- Update existing categories with a default color
UPDATE public.product_categories SET color = '#6B7280' WHERE color IS NULL;
