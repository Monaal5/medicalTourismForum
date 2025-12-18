-- Create polls table
CREATE TABLE IF NOT EXISTS polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  description TEXT,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL, -- Link to category
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE, -- Link to a post
  total_votes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  allow_multiple_votes BOOLEAN DEFAULT FALSE
);

-- Create poll options table
CREATE TABLE IF NOT EXISTS poll_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  vote_count INT DEFAULT 0,
  option_order INT DEFAULT 0
);

-- Create poll votes table
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- Enable RLS
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Policies for Polls
CREATE POLICY "Public polls are viewable by everyone" ON polls FOR SELECT USING (true);
CREATE POLICY "Users can create polls" ON polls FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Policies for Options
CREATE POLICY "Public options are viewable by everyone" ON poll_options FOR SELECT USING (true);
CREATE POLICY "Users can create options" ON poll_options FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM polls WHERE id = poll_id AND author_id = auth.uid())
);

-- Policies for Votes
CREATE POLICY "Users can view votes" ON poll_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
