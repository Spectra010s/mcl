-- My Campus Library - Core Tables Database Schema

-- ===========================================
-- CORE TABLES
-- ===========================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  bio TEXT,
  profile_picture_url VARCHAR(512),
  contribution_count INTEGER DEFAULT 0,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Faculties table
CREATE TABLE IF NOT EXISTS faculties (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon_url VARCHAR(512),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id BIGSERIAL PRIMARY KEY,
  faculty_id BIGINT NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(faculty_id, name)
);

-- Academic Levels table (100, 200, 300, 400, 500)
CREATE TABLE IF NOT EXISTS academic_levels (
  id BIGSERIAL PRIMARY KEY,
  department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL CHECK (level_number IN (100, 200, 300, 400, 500)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(department_id, level_number)
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id BIGSERIAL PRIMARY KEY,
  academic_level_id BIGINT NOT NULL REFERENCES academic_levels(id) ON DELETE CASCADE,
  course_code VARCHAR(50) NOT NULL,
  course_title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(academic_level_id, course_code)
);

-- Resources table (uploaded files)
CREATE TABLE IF NOT EXISTS resources (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(512) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size_bytes BIGINT,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT FALSE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

