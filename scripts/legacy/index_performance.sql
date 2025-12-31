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

CREATE INDEX IF NOT EXISTS idx_resources_fts ON resources USING GIN (fts_document);

CREATE INDEX IF NOT EXISTS idx_resource_keywords_keyword_trgm ON resource_keywords USING GIN (keyword gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_resources_upload_date ON resources(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_resources_download_count ON resources(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_resources_bookmark_count ON resources(bookmark_count DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(course_code);

CREATE INDEX IF NOT EXISTS idx_user_bookmarks_resource_id ON user_bookmarks(resource_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_download_history_user_resource ON download_history(user_id, resource_id);
