-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  min_reputation INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_badges table (many-to-many)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Public read user_badges" ON user_badges FOR SELECT USING (true);

-- Insert default badges
INSERT INTO badges (name, description, min_reputation, icon_url)
VALUES 
('Newcomer', 'Welcome to the community!', 0, '👋'),
('Rising Star', 'Gaining trust in the community.', 50, '⭐'),
('Top Contributor', 'Highly valued member.', 100, '🏆'),
('Expert', 'Recognized expert in medical tourism.', 500, '👑')
ON CONFLICT (name) DO NOTHING;
