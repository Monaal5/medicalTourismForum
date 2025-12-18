
-- Add employment column
alter table users 
add column if not exists employment text;
