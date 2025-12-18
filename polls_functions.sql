-- Helper functions for poll voting
-- Run this after running polls.sql or polls_migration.sql

-- Function to increment poll option votes
CREATE OR REPLACE FUNCTION increment_poll_option_votes(option_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE poll_options
    SET vote_count = vote_count + 1
    WHERE id = option_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment total poll votes
CREATE OR REPLACE FUNCTION increment_poll_total_votes(poll_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE polls
    SET total_votes = total_votes + 1
    WHERE id = poll_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_poll_option_votes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_poll_total_votes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_poll_option_votes(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_poll_total_votes(UUID) TO anon;
