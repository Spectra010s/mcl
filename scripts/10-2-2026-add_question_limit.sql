ALTER TABLE cbts ADD COLUMN IF NOT EXISTS question_limit INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION generate_attempt_questions(p_attempt_id BIGINT)
RETURNS void AS $$
DECLARE
  v_cbt_id BIGINT;
  v_limit INTEGER;
BEGIN
  SELECT c.id, c.question_limit INTO v_cbt_id, v_limit
  FROM cbts c
  JOIN cbt_attempts ca ON ca.cbt_id = c.id
  WHERE ca.id = p_attempt_id;
  INSERT INTO attempt_questions (attempt_id, question_id, order_index)
  SELECT p_attempt_id, q.id, ROW_NUMBER() OVER (ORDER BY RANDOM())
  FROM questions q
  WHERE q.cbt_id = v_cbt_id
  ORDER BY RANDOM()
  LIMIT (CASE WHEN v_limit > 0 THEN v_limit ELSE (SELECT count(*) FROM questions WHERE cbt_id = v_cbt_id) END);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
