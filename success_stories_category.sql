-- Insert Success Stories category if it doesn't exist
INSERT INTO categories (name, slug, icon, color)
VALUES ('Success Stories', 'success-stories', 'Trophy', 'yellow')
ON CONFLICT (slug) DO NOTHING;
