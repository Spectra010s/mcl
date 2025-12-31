SELECT
  tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE
  tc.table_name = 'resources'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'uploaded_by';

ALTER TABLE resources
DROP CONSTRAINT resources_uploaded_by_fkey;

ALTER TABLE resources
ALTER COLUMN uploaded_by DROP NOT NULL;

ALTER TABLE resources
ADD CONSTRAINT resources_uploaded_by_fkey
FOREIGN KEY (uploaded_by)
REFERENCES users(id)
ON DELETE SET NULL;