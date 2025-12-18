-- Add description column to categories if it doesn't exist
alter table categories add column if not exists description text;
