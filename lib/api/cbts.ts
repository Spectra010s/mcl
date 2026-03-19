export interface Course {
  id: number
  course_code: string
  course_title: string
  academic_levels: {
    level_number: number
    departments: {
      short_name: string
      full_name: string
    }
  }
}

export interface CBT {
  id: number
  title: string
  description: string | null
  time_limit_minutes: number | null
  passing_score: number
  courses: Course
}

export interface Attempt {
  id: number
  attempt_number: number
  score: number | null
  passed: boolean | null
  started_at: string
  completed_at: string | null
  time_taken_seconds: number | null
  total_points_earned: number | null
  total_points_possible: number | null
}

export interface QuestionOption {
  id: number
  option_text: string
}

export interface Question {
  shuffled_index: number
  question_id: number
  question_text: string
  question_type: string
  options: QuestionOption[]
}

export interface AttemptData {
  attempt: Attempt & { cbts: CBT }
  questions: Question[]
  answers: Record<string, string>
}

export interface ReviewOption {
  id: number
  option_text: string
  is_correct: boolean
}

export interface ReviewItem {
  order_index: number
  question_text: string
  explanation: string | null
  user_choice_id: number | null
  user_choice_text: string | null
  is_user_correct: boolean
  options: ReviewOption[]
}

export const fetchAttempt = async (attemptId: number): Promise<AttemptData> => {
  const response = await fetch(`/api/cbts/attempts/${attemptId}`)
  if (!response.ok) throw new Error('Failed to fetch attempt')
  return response.json()
}

export const startCBTAttempt = async (cbtId: number): Promise<Attempt> => {
  const response = await fetch(`/api/cbts/${cbtId}/attempts`, {
    method: 'POST',
  })
  if (!response.ok) {
    if (response.status === 409) {
      const data = await response.json()
      throw { status: 409, attemptId: data.attemptId }
    }
    throw new Error('Failed to start test')
  }
  return response.json()
}

export const saveCBTAnswer = async (attemptId: number, questionId: number, optionId: number) => {
  const response = await fetch(`/api/cbts/attempts/${attemptId}/answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      questionId,
      selectedOptionId: optionId,
    }),
  })
  if (!response.ok) throw new Error('Failed to save answer')
  return response.json()
}

export const submitCBTAttempt = async (attemptId: number): Promise<Attempt> => {
  const response = await fetch(`/api/cbts/attempts/${attemptId}/submit`, {
    method: 'POST',
  })
  if (!response.ok) throw new Error('Failed to submit test')
  return response.json()
}

export const fetchCBTReview = async (attemptId: number): Promise<ReviewItem[]> => {
  const response = await fetch(`/api/cbts/attempts/${attemptId}/review`)
  if (!response.ok) throw new Error('Failed to load review')
  const data = await response.json()
  return data.review
}

export const fetchCBTAttempts = async (cbtId: number): Promise<Attempt[]> => {
  const response = await fetch(`/api/cbts/${cbtId}/attempts`)
  if (!response.ok) throw new Error('Failed to fetch attempts')
  return response.json()
}
