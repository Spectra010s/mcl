WITH al AS (
  SELECT al.id
  FROM academic_levels al
  JOIN departments d ON al.department_id = d.id
  WHERE d.short_name = 'GNC' AND al.level_number = 200
  LIMIT 1
)
INSERT INTO courses (academic_level_id, course_code, course_title, description)
SELECT
  al.id,
  v.code,
  v.title,
  v.descr
FROM al
CROSS JOIN (VALUES
  ('ENG 201', 'Applied Electricity I', 'Basic electrical principles, circuits, measurements, and practical applications.'),
  ('ENG 209', 'Engineering Mathematics I', 'Core mathematical tools for engineering including calculus and algebraic methods.'),
  ('ENG 207', 'Applied Mechanics', 'Study of forces, motion, equilibrium, and mechanical systems.'),
  ('ENT 201', 'Entrepreneurship and Innovation', 'Foundations of entrepreneurship, opportunity creation, and innovative thinking.'),
  ('GST 203', 'Government, Society and Economy', 'Overview of governance structures, societal development, and economic systems.'),
  ('GST 201', 'Philosophy, Logic & Human Experience', 'Introduction to logical reasoning, critical thinking, and human values.'),
  ('ENG 205', 'Fundamental of Fluid Mechanics', 'Basics of fluid properties, flow behavior, and engineering applications.'),
  ('ENG 203', 'Engineering Graphics and Solid Modelling II', 'Technical drawing, 3D modelling, and visualization techniques for engineering design.'),
   ('ENG 211', 'Computer and Software Engineering', 'Introduction to computer systems, software development, and programming fundamentals.')
) AS v(code, title, descr)
ON CONFLICT (academic_level_id, course_code) DO NOTHING;
