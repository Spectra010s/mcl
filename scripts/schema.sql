-- My Campus Library - Database Schema

-- ===========================================
-- CORE TABLES
-- ===========================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;


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
  short_name VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon_url VARCHAR(512),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id BIGSERIAL PRIMARY KEY,
  faculty_id BIGINT NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  short_name VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(faculty_id, full_name)
);


-- Academic Levels table (100, 200, 300, 400, 500)
CREATE TABLE IF NOT EXISTS academic_levels (
  id BIGSERIAL PRIMARY KEY,
  department_id BIGINT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL CHECK (level_number IN (100, 200, 300, 400, 500, 600)),
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
  keyword_string TEXT
);


-- ========================================
-- USER INTERACTION TABLES
-- ========================================

-- Resource Keywords/Tags
CREATE TABLE IF NOT EXISTS resource_keywords (
  id BIGSERIAL PRIMARY KEY,
  resource_id BIGINT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  keyword VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (resource_id, keyword)
);

-- User Bookmarks
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_id BIGINT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- Download History
CREATE TABLE IF NOT EXISTS download_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_id BIGINT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- View History
CREATE TABLE IF NOT EXISTS view_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  resource_id BIGINT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search History (for authenticated users)
CREATE TABLE IF NOT EXISTS search_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Logs
CREATE TABLE IF NOT EXISTS admin_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  resource_id BIGINT REFERENCES resources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE view_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;


-- Public read access to browse data
CREATE POLICY "Faculties viewable by everyone" ON faculties FOR SELECT USING (true);
CREATE POLICY "Departments viewable by everyone" ON departments FOR SELECT USING (true);
CREATE POLICY "Academic levels viewable by everyone" ON academic_levels FOR SELECT USING (true);
CREATE POLICY "Courses viewable by everyone" ON courses FOR SELECT USING (true);

-- Resources: approved resources viewable by everyone
CREATE POLICY "Admins can update all resources"
ON resources
  FOR UPDATE
  USING (
    EXISTS(
      SELECT 1 FROM users
      WHERE auth.uid() = users.id
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Approved resources viewable by everyone" ON resources
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users see own unapproved resources" ON resources
  FOR SELECT USING (auth.uid() = uploaded_by OR is_approved = true);

CREATE POLICY "Users can upload resources" ON resources
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- User profiles: publicly viewable
CREATE POLICY "User profiles viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Bookmarks: only accessible by owner
CREATE POLICY "Users manage own bookmarks" ON user_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- Download history: only accessible by owner
CREATE POLICY "Users view own downloads" ON download_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users record own downloads" ON download_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- View history: only accessible by owner
  CREATE POLICY "Users record own views" ON view_history 
  FOR INSERT WITH CHECK (
   auth.uid() = user_id
  );
  
CREATE POLICY "Users view own view history" ON view_history 
  FOR SELECT USING (
    auth.uid() = user_id
  );


CREATE POLICY "Anon record views" ON view_history 
  FOR INSERT TO anon USING (
    auth.uid() IS NULL AND user_id IS NULL
  ) WITH CHECK (
    auth.uid() IS NULL AND user_id IS NULL
  );

-- Search history: only accessible by owner
CREATE POLICY "Users view search history" ON search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users record searches" ON search_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin logs: only admins can view
CREATE POLICY "Admins view logs" ON admin_logs
  FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));


--  ==== Alter Resources for FTS =====
ALTER TABLE resources ADD COLUMN search_vector tsvector;
 
-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_resources_course_id ON resources(course_id);
CREATE INDEX IF NOT EXISTS idx_resources_uploaded_by ON resources(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_resources_is_approved ON resources(is_approved);
CREATE INDEX IF NOT EXISTS idx_departments_faculty_id ON departments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_academic_levels_department_id ON academic_levels(department_id);
CREATE INDEX IF NOT EXISTS idx_courses_academic_level_id ON courses(academic_level_id);
CREATE INDEX IF NOT EXISTS idx_download_history_user_id ON download_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);

CREATE INDEX IF NOT EXISTS resources_search_idx ON resources USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_resources_title_trgm ON resources USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_resources_keyword_string_trgm ON resources USING GIN (keyword_string gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_resources_description_trgm ON resources USING GIN (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_resources_upload_date ON resources(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_resources_download_count ON resources(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_resources_bookmark_count ON resources(bookmark_count DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(course_code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_view_history_user_resource ON view_history(user_id, resource_id)
  WHERE user_id IS NOT NULL; 
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_resource_id ON user_bookmarks(resource_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_download_history_user_resource ON download_history(user_id, resource_id);

-- ========================================
-- FUNCTIONS
-- =========================================

-- Function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', substring(NEW.email from 1 for position('@' in NEW.email) - 1)), 
    NEW.raw_user_meta_data->>'first_name', 
    NEW.raw_user_meta_data->>'last_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



-- Triggee for user creation after aith
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE VIEW resources_with_keywords AS
SELECT
    r.*,
    STRING_AGG(rk.keyword, ' ') AS all_keywords
FROM
    resources r
LEFT JOIN
    resource_keywords rk ON r.id = rk.resource_id
GROUP BY
    r.id;
    
-- Create a function to update the search_vector
CREATE OR REPLACE FUNCTION update_search_resources_and_keywords()
RETURNS TRIGGER AS $$
DECLARE
    keywords TEXT; 
BEGIN

  SELECT all_keywords INTO keywords FROM resources_with_keywords WHERE id = NEW.id LIMIT 1;

  NEW.keyword_string := keywords; 

  NEW.search_vector := setweight(to_tsvector('english', NEW.title), 'A') ||
                       setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
                       setweight(to_tsvector('english', coalesce(keywords, '')), 'C');
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER set_search_resources_and_keywords
BEFORE INSERT OR UPDATE ON resources
FOR EACH ROW EXECUTE FUNCTION update_search_resources_and_keywords();

CREATE OR REPLACE FUNCTION update_resource_search_vector_from_keywords()
RETURNS TRIGGER AS $$
DECLARE
    keywords_string TEXT;
BEGIN

    SELECT STRING_AGG(keyword, ' ') INTO keywords_string
    FROM resource_keywords 
    WHERE resource_id = NEW.resource_id;

    UPDATE resources
    SET 
      keyword_string = keywords_string, 
      search_vector = setweight(to_tsvector('english', title), 'A') ||
                      setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
                      setweight(to_tsvector('english', coalesce(keywords_string, '')), 'C')
    WHERE id = NEW.resource_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_keywords_update_search_vector
AFTER INSERT OR UPDATE OR DELETE ON resource_keywords
FOR EACH ROW EXECUTE FUNCTION update_resource_search_vector_from_keywords();

CREATE OR REPLACE FUNCTION search_resources_keywords_fuzzy(search_term text)
RETURNS SETOF resources AS $$
SELECT r.*
FROM resources r
WHERE r.is_approved = TRUE
  AND (
       r.title % search_term
    OR r.description % search_term
    OR r.keyword_string % search_term 
  )
ORDER BY GREATEST(
          similarity(r.title, search_term), 
          similarity(r.description, search_term),
          similarity(COALESCE(r.keyword_string, ''), search_term)
       ) DESC
LIMIT 20;
$$ LANGUAGE SQL STABLE;

-- Function to increment contribution count
CREATE OR REPLACE FUNCTION increment_contribution_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_approved = true AND (TG_OP = 'INSERT' OR OLD.is_approved = false) THEN
    UPDATE users
    SET contribution_count = contribution_count + 1
    WHERE id = NEW.uploaded_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update contribution count when resource approved
CREATE TRIGGER trigger_increment_contribution
AFTER INSERT OR UPDATE ON resources
FOR EACH ROW EXECUTE FUNCTION increment_contribution_count();

CREATE OR REPLACE FUNCTION increment_view_count()
RETURNS TRIGGER AS $$
BEGIN

  IF NEW.user_id IS NOT NULL THEN

    PERFORM 1
    FROM view_history
    WHERE 
      resource_id = NEW.resource_id AND 
      user_id = NEW.user_id AND 
      viewed_at >= NOW() - INTERVAL '24 hours' AND
      id != NEW.id 
    LIMIT 1;
    
    IF FOUND THEN
      RETURN NEW; 
    END IF;
  END IF;

  UPDATE resources
  SET view_count = view_count + 1
  WHERE id = NEW.resource_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The TRIGGER remains the same:
CREATE TRIGGER trigger_increment_view_count
AFTER INSERT ON view_history
FOR EACH ROW EXECUTE FUNCTION increment_view_count();


-- ==========================================
-- COMPLETION
-- ==========================================