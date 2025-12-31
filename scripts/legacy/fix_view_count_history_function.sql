-- Fix on vuew count function

---  If a guest views a resource (user_id is NULL), the function immediately hits the RETURN NEW; at the end of the IF NEW.user_id IS NOT NULL THEN block, and the UPDATE resources SET view_count... statement is never reached. 
------

CREATE OR REPLACE FUNCTION increment_view_count()
RETURNS TRIGGER AS $$
BEGIN

  -- 1. CHECK FOR LOGGED-IN USERS (24-Hour Check)
  IF NEW.user_id IS NOT NULL THEN
    -- Check if the same logged-in user has viewed this resource in the last 24 hours.
    PERFORM 1
    FROM view_history
    WHERE 
      resource_id = NEW.resource_id AND 
      user_id = NEW.user_id AND 
      viewed_at >= NOW() - INTERVAL '24 hours' AND
      id != NEW.id -- Exclude the current row being inserted
    LIMIT 1;
    
    -- If a previous view was found within 24 hours, stop the function early (don't count).
    IF FOUND THEN
      RETURN NEW; 
    END IF;
  END IF;

  -- 2. UPDATE VIEW COUNT (This runs if user is NULL (Guest), OR if user is 
  --    logged in and passed the 24-hour uniqueness check.)
  UPDATE resources
  SET view_count = view_count + 1
  WHERE id = NEW.resource_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
