-- Create Reports Table
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references users(id),
  target_type text not null check (target_type in ('post', 'question', 'answer', 'comment', 'user')),
  target_id uuid not null,
  reason text not null,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamp with time zone default now()
);

-- Enable RLS for reports
alter table reports enable row level security;

-- Add anonymous column to posts if not exists
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'posts' and column_name = 'is_anonymous') then
    alter table posts add column is_anonymous boolean default false;
  end if;
end $$;

-- Add anonymous column to questions if not exists
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'questions' and column_name = 'is_anonymous') then
    alter table questions add column is_anonymous boolean default false;
  end if;
end $$;

-- Add is_reported to questions, answers, comments if not exists
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'questions' and column_name = 'is_reported') then
    alter table questions add column is_reported boolean default false;
  end if;
end $$;

do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'answers' and column_name = 'is_reported') then
    alter table answers add column is_reported boolean default false;
  end if;
end $$;

do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'comments' and column_name = 'is_reported') then
    alter table comments add column is_reported boolean default false;
  end if;
end $$;


-- Add reputation column to users if not exists
do d:\med\medicalTourismForum 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'reputation') then
    alter table users add column reputation int default 0;
  end if;
end d:\med\medicalTourismForum;
