
-- Add new columns to users table for extended profile
alter table users 
add column if not exists education text,
add column if not exists location text,
add column if not exists social_links jsonb default '{}'::jsonb;
-- social_links structure: { "twitter": "url", "linkedin": "url", "instagram": "url", "facebook": "url", "website": "url" }
