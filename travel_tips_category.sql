-- Insert Travel Tips category
INSERT INTO categories (name, slug, icon, color)
VALUES ('Travel Tips', 'travel-tips', 'Plane', 'blue')
ON CONFLICT (slug) DO NOTHING;
