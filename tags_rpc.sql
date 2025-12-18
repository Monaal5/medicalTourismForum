
-- Function to get popular matching tags from questions and posts
create or replace function get_matching_tags(query_text text)
returns table (tag text, count bigint) 
language sql
security definer
as $$
  with all_tags as (
    select unnest(tags) as tag from questions
    union all
    select unnest(tags) as tag from posts
  )
  select tag, count(*) as count
  from all_tags
  where tag ilike '%' || query_text || '%'
  group by tag
  order by count desc, tag asc
  limit 20;
$$;
