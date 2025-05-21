CREATE TABLE IF NOT EXISTS secondary_grid (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  alt TEXT,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default images
INSERT INTO secondary_grid (url, alt, position)
VALUES 
  ('/premium-products.png', 'Premium products', 1),
  ('/serene-landscape.png', 'Serene landscape', 2),
  ('/diverse-group-relaxing.png', 'Diverse group relaxing', 3),
  ('/premium-products.png', 'Premium products', 4);
