-- ===========================================
-- USER INTERACTION TABLES
-- ===========================================

-- Resource Keywords/Tags
CREATE TABLE IF NOT EXISTS resource_keywords (
  id BIGSERIAL PRIMARY KEY,
  resource_id BIGINT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  keyword VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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