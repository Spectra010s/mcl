-- Create public view for eveyone 

CREATE VIEW profiles AS
SELECT
  username,
  profile_picture_url,
  bio,
  contribution_count
FROM users;

GRANT SELECT ON profiles TO anon;

-- Drop the old public policy first
DROP POLICY IF EXISTS "User profiles viewable by everyone" ON users;

-- Create a new policy: only user can view their own profile
CREATE POLICY "Users can view their own profile"
ON users
FOR SELECT
USING (auth.uid() = id); 