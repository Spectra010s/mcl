-- ========================================
-- CBT SYSTEM TABLES
-- ========================================

CREATE TABLE IF NOT EXISTS cbts (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL, 
  title VARCHAR(255) NOT NULL,
  description TEXT,
  time_limit_minutes INTEGER,
  passing_score INTEGER DEFAULT 70,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  cbt_id BIGINT NOT NULL REFERENCES cbts(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('mcq', 'boolean')),
  points INTEGER DEFAULT 1,
  shuffle_options BOOLEAN DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS question_options (
  id BIGSERIAL PRIMARY KEY,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS cbt_attempts (
  id BIGSERIAL PRIMARY KEY,
  cbt_id BIGINT NOT NULL REFERENCES cbts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  score INTEGER,
  total_points_earned INTEGER,
  total_points_possible INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_taken_seconds INTEGER,
  passed BOOLEAN
);

CREATE TABLE IF NOT EXISTS attempt_questions (
  id BIGSERIAL PRIMARY KEY,
  attempt_id BIGINT NOT NULL REFERENCES cbt_attempts(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_answers (
  id BIGSERIAL PRIMARY KEY,
  attempt_id BIGINT NOT NULL REFERENCES cbt_attempts(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id BIGINT REFERENCES question_options(id) ON DELETE SET NULL,
  is_correct BOOLEAN DEFAULT FALSE, 
  points_earned INTEGER DEFAULT 0,   
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================
-- 1. SECURITY: ANTI-CHEAT TRIGGER
-- =====================================

CREATE OR REPLACE FUNCTION fn_validate_user_answer()
RETURNS TRIGGER AS $$
BEGIN
  SELECT is_correct INTO NEW.is_correct
  FROM question_options
  WHERE id = NEW.selected_option_id;

  IF NEW.is_correct THEN
    SELECT points INTO NEW.points_earned FROM questions WHERE id = NEW.question_id;
  ELSE
    NEW.points_earned := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_validate_user_answer
BEFORE INSERT OR UPDATE ON user_answers
FOR EACH ROW EXECUTE FUNCTION fn_validate_user_answer();

-- =======================================
-- 2. SCORING: HANDLE UNANSWERED QUESTIONS
-- ======================================

CREATE OR REPLACE FUNCTION calculate_attempt_score(p_attempt_id BIGINT)
RETURNS void AS $$
DECLARE
  v_total_earned INTEGER;
  v_total_possible INTEGER;
  v_score INTEGER;
  v_passing_score INTEGER;
BEGIN
  SELECT 
    COALESCE(SUM(ua.points_earned), 0),
    COALESCE(SUM(q.points), 0)
  INTO v_total_earned, v_total_possible
  FROM attempt_questions aq
  JOIN questions q ON q.id = aq.question_id
  LEFT JOIN user_answers ua ON (ua.attempt_id = aq.attempt_id AND ua.question_id = aq.question_id)
  WHERE aq.attempt_id = p_attempt_id;

  v_score := CASE 
    WHEN v_total_possible > 0 THEN ROUND((v_total_earned::DECIMAL / v_total_possible::DECIMAL) * 100)
    ELSE 0 
  END;

  SELECT c.passing_score INTO v_passing_score
  FROM cbt_attempts a
  JOIN cbts c ON c.id = a.cbt_id
  WHERE a.id = p_attempt_id;

  UPDATE cbt_attempts
  SET 
    score = v_score,
    total_points_earned = v_total_earned,
    total_points_possible = v_total_possible,
    passed = (v_score >= v_passing_score),
    completed_at = NOW(),
    time_taken_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))
  WHERE id = p_attempt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================
-- 3. UTILITY: GENERATE RANDOM QUESTIONS
-- =====================================

CREATE OR REPLACE FUNCTION generate_attempt_questions(p_attempt_id BIGINT)
RETURNS void AS $$
BEGIN
  INSERT INTO attempt_questions (attempt_id, question_id, order_index)
  SELECT p_attempt_id, q.id, ROW_NUMBER() OVER (ORDER BY RANDOM())
  FROM questions q
  WHERE q.cbt_id = (SELECT cbt_id FROM cbt_attempts WHERE id = p_attempt_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================
-- 4. FETCH QUESTIONS (FOR TAKING TEST)
-- =====================================

CREATE OR REPLACE FUNCTION get_questions_for_attempt(p_attempt_id BIGINT)
RETURNS TABLE (
  shuffled_index INTEGER,
  question_id BIGINT,
  question_text TEXT,
  question_type VARCHAR,
  options JSONB
) AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM cbt_attempts WHERE id = p_attempt_id AND completed_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'This attempt is already finished.';
  END IF;

  RETURN QUERY
  SELECT 
    aq.order_index,
    q.id,
    q.question_text,
    q.question_type,
    jsonb_agg(
      jsonb_build_object(
        'id', qo.id,
        'option_text', qo.option_text
      ) ORDER BY qo.order_index ASC
    ) as options
  FROM attempt_questions aq
  JOIN questions q ON q.id = aq.question_id
  JOIN question_options qo ON qo.question_id = q.id
  WHERE aq.attempt_id = p_attempt_id
  GROUP BY aq.order_index, q.id, q.question_text, q.question_type
  ORDER BY aq.order_index ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================
-- 5. REVIEW FUNCTION (FOR RESULTS PAGE)
-- =====================================

CREATE OR REPLACE FUNCTION get_attempt_review(p_attempt_id BIGINT)
RETURNS TABLE (
  order_index INTEGER,
  question_text TEXT,
  explanation TEXT,
  user_choice_text TEXT,
  correct_option_text TEXT,
  is_user_correct BOOLEAN,
  points_earned INTEGER
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
    qo_user.option_text AS user_choice_text,
    qo_correct.option_text AS correct_option_text,
    ua.is_correct AS is_user_correct,
    ua.points_earned
  FROM attempt_questions aq
  JOIN questions q ON q.id = aq.question_id
  LEFT JOIN user_answers ua ON (ua.attempt_id = aq.attempt_id AND ua.question_id = aq.question_id)
  LEFT JOIN question_options qo_user ON qo_user.id = ua.selected_option_id
  LEFT JOIN question_options qo_correct ON (qo_correct.question_id = q.id AND qo_correct.is_correct = TRUE)
  WHERE aq.attempt_id = p_attempt_id
  ORDER BY aq.order_index ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================
-- 6. CONSTRAINTS & INDEXES
-- =====================================

CREATE UNIQUE INDEX IF NOT EXISTS one_correct_option_per_question ON question_options(question_id) WHERE is_correct = true;
CREATE UNIQUE INDEX IF NOT EXISTS one_answer_per_question_per_attempt ON user_answers(attempt_id, question_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_attempt_id ON user_answers(attempt_id);

-- =====================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =====================================

ALTER TABLE cbts ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE cbt_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;

-- CBTs: Visible to all authenticated users if active
CREATE POLICY "Anyone can view active cbts" ON cbts 
FOR SELECT TO authenticated USING (is_active = true);

-- Attempts: Users can only see/create their own attempts
CREATE POLICY "Users can manage own attempts" ON cbt_attempts 
FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Attempt Questions: Users can see questions assigned to their attempts
CREATE POLICY "Users can see own attempt questions" ON attempt_questions 
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM cbt_attempts WHERE id = attempt_id AND user_id = auth.uid()));

-- Answers: Users can only manage answers for their own attempts
CREATE POLICY "Users can manage own answers" ON user_answers 
FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM cbt_attempts WHERE id = attempt_id AND user_id = auth.uid()));
