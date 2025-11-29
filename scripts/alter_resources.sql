 ALTER TABLE resources ADD COLUMN fts_document tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') || 
  setweight(to_tsvector('english', coalesce(description, '')), 'B')
 ) STORED;