-- One cant use comma after a SQL command except for ADD Column consecutively, so a command and its ALTER TABLE ---

ALTER TABLE faculties
  RENAME COLUMN name TO short_name;

ALTER TABLE faculties
  ADD COLUMN full_name VARCHAR(255) UNIQUE NOT NULL;

ALTER TABLE departments
  RENAME COLUMN name TO short_name;

ALTER TABLE departments
  ADD COLUMN full_name VARCHAR(255) UNIQUE NOT NULL;