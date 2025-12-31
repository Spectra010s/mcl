-- ========================================
-- SEED DATA - Faculty of Engineering
-- =========================================

INSERT INTO faculties (full_name, short_name, description) VALUES
  ('Faculty of Engineering', 'ENG.F', 'The Faculty of Engineering offers programs that combine theory and practical application across multiple engineering disciplines including mechatronics, mechanical, electrical, civil, and materials engineering.')
ON CONFLICT (full_name) DO NOTHING;

-- Engineering Departments
INSERT INTO departments (faculty_id, full_name, short_name, description) VALUES
  ((SELECT id FROM faculties WHERE full_name = 'Faculty of Engineering'), 'Mechatronics Engineering', 'MTE', 'Focuses on the integration of mechanical, electrical, and computer systems to design and optimize intelligent machines and automated systems.'),
  ((SELECT id FROM faculties WHERE full_name = 'Faculty of Engineering'), 'Material and Metallurgical Engineering', 'MME', 'Covers the study, processing, and development of materials, including metals and alloys, for industrial and technological applications.'),
  ((SELECT id FROM faculties WHERE full_name = 'Faculty of Engineering'), 'Agriculture and Bio-Resources Engineering', 'ABE', 'Applies engineering principles to improve agricultural productivity, bio-resource management, and sustainable farming technologies.'),
  ((SELECT id FROM faculties WHERE full_name = 'Faculty of Engineering'), 'Electrical and Electronics Engineering', 'EEE', 'Deals with the study, design, and application of electrical systems, electronic devices, and power generation and distribution technologies.'),
  ((SELECT id FROM faculties WHERE full_name = 'Faculty of Engineering'), 'Civil Engineering', 'CVE', 'Encompasses the design, construction, and maintenance of infrastructure such as buildings, roads, bridges, and water systems.'),
  ((SELECT id FROM faculties WHERE full_name = 'Faculty of Engineering'), 'Mechanical Engineering', 'MEE', 'Focuses on the design, analysis, manufacturing, and maintenance of mechanical systems and machinery.')
ON CONFLICT (faculty_id, full_name) DO NOTHING;

-- Add General Courses as a special department
INSERT INTO departments (faculty_id, full_name, short_name, description) VALUES
  ((SELECT id FROM faculties WHERE full_name = 'Faculty of Engineering'), 'General Courses', 'GNC', 'Faculty-wide courses designed to provide foundational knowledge and skills applicable across all engineering disciplines.')
ON CONFLICT (faculty_id, full_name) DO NOTHING;

-- Academic levels for each department (100-500)
INSERT INTO academic_levels (department_id, level_number)
SELECT d.id, level
FROM departments d
CROSS JOIN (VALUES (100), (200), (300), (400), (500)) AS levels(level)
WHERE d.faculty_id = (SELECT id FROM faculties WHERE full_name = 'Faculty of Engineering')
ON CONFLICT (department_id, level_number) DO NOTHING;