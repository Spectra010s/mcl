-- Add foreign key constraint to cbts table
ALTER TABLE cbts
ADD CONSTRAINT fk_cbts_courses
FOREIGN KEY (course_id)
REFERENCES courses(id)
ON DELETE CASCADE;
