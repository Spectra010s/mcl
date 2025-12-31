-- the fts funtion to be used in client
CREATE OR REPLACE FUNCTION search_resources_fts(search_term text)
RETURNS SETOF resources AS $$
SELECT *
FROM resources
WHERE is_approved = TRUE
  AND search_vector @@ plainto_tsquery('english', search_term)
ORDER BY ts_rank_cd(search_vector, plainto_tsquery('english', search_term)) DESC
LIMIT 50;
$$ LANGUAGE SQL STABLE;