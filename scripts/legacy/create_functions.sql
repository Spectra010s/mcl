-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', substring(NEW.email from 1 for position('@' in NEW.email) - 1))
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggee for user creation aftee aith
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION search_resources_and_keywords(search_term TEXT)
RETURNS SETOF resources
LANGUAGE sql
AS $$
    -- Find resources where title or description matches using Full-Text Search (FTS)
    SELECT *
    FROM resources
    
    WHERE fts_document @@ to_tsquery('english', search_term)
    
    UNION 
    
    -- Find resources where an associated keyword matches using Trigram Index
    SELECT r.*
    FROM resources r
    JOIN resource_keywords rk ON r.id = rk.resource_id

    WHERE rk.keyword % search_term; 
$$;

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
DROP TRIGGER IF EXISTS trigger_increment_contribution ON resources;
CREATE TRIGGER trigger_increment_contribution
AFTER INSERT OR UPDATE ON resources
FOR EACH ROW EXECUTE FUNCTION increment_contribution_count();
