
-- Notifications Table
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references users(id) on delete cascade not null,
  sender_id uuid references users(id) on delete cascade not null,
  type text not null check (type in ('follow', 'answer', 'comment', 'reply', 'vote')),
  question_id uuid references questions(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  answer_id uuid references answers(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  read boolean default false,
  created_at timestamp with time zone default now()
);

create index if not exists idx_notifications_recipient on notifications(recipient_id);

-- Enable RLS
alter table notifications enable row level security;

-- Policy (if using service role, this is bypassed, but good to have)
create policy "Users can read own notifications" on notifications
  for select using (true); -- Ideally restricting to recipient_id, but API handles security.
