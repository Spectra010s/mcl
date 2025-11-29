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
CREATE POLICY "Users view own history" ON view_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users record own views" ON view_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Search history: only accessible by owner
CREATE POLICY "Users view search history" ON search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users record searches" ON search_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin logs: only admins can view
CREATE POLICY "Admins view logs" ON admin_logs
  FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
