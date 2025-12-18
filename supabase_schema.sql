
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  username text,
  email text,
  image_url text,
  bio text,
  joined_at timestamp with time zone default now(),
  is_reported boolean default false,
  role text default 'user' -- 'admin', 'moderator'
);

-- Communities Table
create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  image_url text,
  moderator_id uuid references users(id),
  is_deleted boolean default false,
  created_at timestamp with time zone default now()
);

-- Categories Table
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  icon text,
  color text,
  description text
);

-- Posts Table
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body jsonb,
  image_url text,
  gallery jsonb,
  tags text[],
  author_id uuid references users(id),
  community_id uuid references communities(id),
  category_id uuid references categories(id),
  is_reported boolean default false,
  published_at timestamp with time zone default now()
);

-- Questions Table
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  tags text[],
  author_id uuid references users(id),
  category_id uuid references categories(id),
  is_answered boolean default false,
  view_count int default 0,
  created_at timestamp with time zone default now()
);

-- Answers Table
create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references questions(id) on delete cascade,
  author_id uuid references users(id),
  body jsonb,
  is_accepted boolean default false,
  created_at timestamp with time zone default now()
);

-- Comments Table
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references users(id),
  post_id uuid references posts(id) on delete cascade,
  answer_id uuid references answers(id) on delete cascade,
  body text,
  parent_comment_id uuid references comments(id),
  created_at timestamp with time zone default now()
);

-- Votes Table (Polymorphic-ish: item_type + item_id)
-- Or separate tables. Let's use a single table for simplicity or separate if constraints are complex.
-- Given 'item_type', 'item_id' pattern in migration plan.
create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  item_type text not null check (item_type in ('post', 'question', 'answer', 'comment')),
  item_id uuid not null,
  vote_type text not null check (vote_type in ('upvote', 'downvote')),
  created_at timestamp with time zone default now(),
  unique(user_id, item_type, item_id)
);

-- Bookmarks Table
create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  created_at timestamp with time zone default now(),
  check (
    (question_id is not null and post_id is null) or
    (question_id is null and post_id is not null)
  ),
  unique(user_id, question_id, post_id)
);

-- Followers Table
create table if not exists user_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references users(id) on delete cascade,
  following_id uuid references users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(follower_id, following_id)
);


-- Indexing for performance
create index if not exists idx_users_clerk_id on users(clerk_id);
create index if not exists idx_posts_author_id on posts(author_id);
create index if not exists idx_questions_author_id on questions(author_id);
create index if not exists idx_answers_question_id on answers(question_id);
create index if not exists idx_comments_post_id on comments(post_id);
create index if not exists idx_votes_item on votes(item_type, item_id);
create index if not exists idx_bookmarks_user on bookmarks(user_id);

-- RLS Policies (Enable RLS)
alter table users enable row level security;
alter table communities enable row level security;
alter table categories enable row level security;
alter table posts enable row level security;
alter table questions enable row level security;
alter table answers enable row level security;
alter table comments enable row level security;
alter table votes enable row level security;
alter table bookmarks enable row level security;
alter table user_follows enable row level security;


-- Public Read Access
create policy "Public read users" on users for select using (true);
create policy "Public read communities" on communities for select using (true);
create policy "Public read categories" on categories for select using (true);
create policy "Public read posts" on posts for select using (true);
create policy "Public read questions" on questions for select using (true);
create policy "Public read answers" on answers for select using (true);
create policy "Public read comments" on comments for select using (true);
create policy "Public read votes" on votes for select using (true);

-- Authenticated Insert/Update
-- (Assuming we will use service role for some ops or authenticated user policies)
-- The 'sync-user' endpoint uses service role key so it bypasses RLS.
-- But for client-side ops (if any), we need policies based on auth.uid() matching clerk_id or internal id.
-- Since we map clerk_id to id in a 'users' table, and Supabase auth.uid() is the clerk_id (if using custom claims) OR if we use Supabase Auth proper.
-- Note: 'auth.uid()' in Supabase corresponds to the ID in 'auth.users'. 
-- IF YOU ARE USING CLERK:
-- You likely interact via service role API from Next.js server actions (which is safe).
-- OR you use the anon key on client, but RLS won't work easily with Clerk without custom JWT.
-- STRATEGY: We will rely on Server Actions / API Routes (using Service Role) for writes.
-- READS can range from Public to Protected.

-- So for now, these tables are readable by everyone (anon), but writable only by service_role (which bypasses RLS).
-- If you want to allow client-side writes, you'd need the Clerk-Supabase integration (custom JWT).
-- We'll assume usage of Server Actions/APIs for writes.
