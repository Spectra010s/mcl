CREATE OR REPLACE FUNCTION search_resources_and_keywords(search_term TEXT)
RETURNS SETOF resources
LANGUAGE sql
AS $$
    -- Find resources where title or description matches
    SELECT *
    FROM resources
    WHERE title ILIKE ('%' || search_term || '%')
       OR description ILIKE ('%' || search_term || '%')
    
    UNION 
    
    -- Find resources where an associated keyword matches
    SELECT r.*
    FROM resources r
    JOIN resource_keywords rk ON r.id = rk.resource_id
    WHERE rk.keyword ILIKE ('%' || search_term || '%');
$$;
