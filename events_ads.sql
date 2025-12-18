-- Create events table for ads/popups
create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  title text,
  image_url text not null,
  link_url text, -- optional link when clicked
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references users(id)
);

-- RLS
alter table events enable row level security;

-- Everyone can view active events
create policy "Public active events are viewable by everyone" 
on events for select 
using (is_active = true);

-- Admins can view all events
create policy "Admins can view all events" 
on events for select 
using (
  exists (select 1 from users where id = auth.uid() and role = 'admin')
);

-- Admins can insert/update/delete events
create policy "Admins can manage events" 
on events for all 
using (
  exists (select 1 from users where id = auth.uid() and role = 'admin')
);

-- Storage bucket for event images (if not exists)
insert into storage.buckets (id, name, public) 
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

create policy "Images are publicly accessible" 
on storage.objects for select 
using (bucket_id = 'event-images');

create policy "Admins can upload event images" 
on storage.objects for insert 
with check (
  bucket_id = 'event-images' 
  and exists (select 1 from users where id = auth.uid() and role = 'admin')
);

create policy "Admins can update event images" 
on storage.objects for update
using (
  bucket_id = 'event-images' 
  and exists (select 1 from users where id = auth.uid() and role = 'admin')
);

create policy "Admins can delete event images" 
on storage.objects for delete
using (
  bucket_id = 'event-images' 
  and exists (select 1 from users where id = auth.uid() and role = 'admin')
);
