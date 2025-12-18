-- Create followers table if it doesn't exist
create table if not exists followers (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references users(id) on delete cascade not null,
  following_id uuid references users(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(follower_id, following_id)
);

-- Create indexes for performance
create index if not exists idx_followers_follower on followers(follower_id);
create index if not exists idx_followers_following on followers(following_id);

-- Enable RLS
alter table followers enable row level security;

-- Policies (Drop first to avoid errors)
drop policy if exists "Anyone can read followers" on followers;
drop policy if exists "Authenticated users can follow" on followers;
drop policy if exists "Users can unfollow" on followers;

-- Simple policies for now
create policy "Anyone can read followers" on followers for select using (true);
create policy "Authenticated users can follow" on followers for insert with check (true); 
create policy "Users can unfollow" on followers for delete using (true); 

-- Grant access (optional but good practice)
grant select, insert, delete on followers to authenticated;
grant select on followers to anon;
