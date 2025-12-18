-- Create bookmarks table
create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  question_id uuid references questions(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(user_id, question_id)
);

-- Indexes
create index if not exists idx_bookmarks_user on bookmarks(user_id);
create index if not exists idx_bookmarks_question on bookmarks(question_id);

-- RLS
alter table bookmarks enable row level security;

drop policy if exists "Users can read own bookmarks" on bookmarks;
drop policy if exists "Users can create own bookmarks" on bookmarks;
drop policy if exists "Users can delete own bookmarks" on bookmarks;

-- Policies (Simplified, authenticated users can manage bookmarks)
-- Note: 'auth.uid()' in Supabase corresponds to the JWT sub. 
-- In our schema, we have 'clerk_id' in users table.
-- If we use Clerk JWT with Supabase, auth.uid() is the Clerk ID.
-- So we need to match user_id (UUID) to users table where clerk_id = auth.uid()

create policy "Users can read own bookmarks" on bookmarks
  for select
  using (
    auth.uid() in (select clerk_id from users where id = bookmarks.user_id)
  );

create policy "Users can create own bookmarks" on bookmarks
  for insert
  with check (
    auth.uid() in (select clerk_id from users where id = bookmarks.user_id)
  );

create policy "Users can delete own bookmarks" on bookmarks
  for delete
  using (
    auth.uid() in (select clerk_id from users where id = bookmarks.user_id)
  );
