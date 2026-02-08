-- This has to be run first before re-creating the function --
DROP FUNCTION get_attempt_review(bigint);

CREATE OR REPLACE FUNCTION get_attempt_review(p_attempt_id BIGINT)
RETURNS TABLE (
  order_index INTEGER,
  question_text TEXT,
  explanation TEXT,
  user_choice_id BIGINT,
  user_choice_text TEXT,
  is_user_correct BOOLEAN,
  options JSONB
) AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM cbt_attempts 
    WHERE id = p_attempt_id 
    AND user_id = auth.uid() 
    AND completed_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Attempt not found or not yet completed.';
  END IF;

  RETURN QUERY
  SELECT 
    aq.order_index,
    q.question_text,
    q.explanation,
    ua.selected_option_id AS user_choice_id,
    qo_user.option_text AS user_choice_text,
    ua.is_correct AS is_user_correct,
    jsonb_agg(
      jsonb_build_object(
        'id', qo.id,
        'option_text', qo.option_text,
        'is_correct', qo.is_correct
      ) ORDER BY qo.order_index ASC
    ) as options
  FROM attempt_questions aq
  JOIN questions q ON q.id = aq.question_id
  LEFT JOIN user_answers ua ON (ua.attempt_id = aq.attempt_id AND ua.question_id = aq.question_id)
  LEFT JOIN question_options qo_user ON qo_user.id = ua.selected_option_id
  JOIN question_options qo ON qo.question_id = q.id
  WHERE aq.attempt_id = p_attempt_id
  GROUP BY aq.order_index, q.question_text, q.explanation, ua.selected_option_id, qo_user.option_text, ua.is_correct
  ORDER BY aq.order_index ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
