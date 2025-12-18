-- Function to get popular matching tags from questions and posts
-- Updated to handle potential type mismatches by casting query_text 
-- and ensuring tag is treated as text.

create or replace function get_matching_tags(query_text text)
returns table (tag text, count bigint) 
language sql
security definer
as $$
  with all_tags as (
    -- Cast unnested tags to text to ensure ILIKE works 
    -- (even if tags were somehow stored as something else, though strict unnest requires array)
    select unnest(tags)::text as tag from questions
    union all
    select unnest(tags)::text as tag from posts
  )
  select tag, count(*) as count
  from all_tags
  -- Use explicit casting for safety
  where tag ilike '%' || query_text || '%'
  group by tag
  order by count desc, tag asc
  limit 20;
$$;
