export interface CBT {
  id: number
  title: string
  description: string | null
  time_limit_minutes: number | null
  passing_score: number
  is_active: boolean
  created_at: string
  courses: {
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
  question_limit: number | null
  _count: {
    questions: number
  }
}

export interface Question {
  id: number
  question_text: string
  question_type: 'mcq' | 'boolean'
  points: number
  order_index: number
  explanation: string | null
  question_options: {
    id: number
    option_text: string
    is_correct: boolean
    order_index: number
  }[]
}

export const fetchAdminCBTs = async (): Promise<CBT[]> => {
  const response = await fetch('/api/admin/cbts', { cache: 'no-store' })
  if (!response.ok) throw new Error('Failed to fetch CBTs')
  return response.json()
}

export const fetchAdminCBT = async (cbtId: string | number): Promise<CBT> => {
  const response = await fetch(`/api/admin/cbts/${cbtId}`, { cache: 'no-store' })
  if (!response.ok) throw new Error('CBT not found')
  return response.json()
}

export const createAdminCBT = async (data: {
  courseId: number
  title: string
  description: string | null
  timeLimitMinutes: number | null
  passingScore: number
  questionLimit: number | null
}): Promise<{ id: number }> => {
  const response = await fetch('/api/admin/cbts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create CBT')
  }
  return response.json()
}

export const updateAdminCBT = async (
  cbtId: string | number,
  data: Partial<{
    title: string
    description: string | null
    time_limit_minutes: number | null
    passing_score: number
    is_active: boolean
    question_limit: number | null
  }>,
) => {
  const response = await fetch(`/api/admin/cbts/${cbtId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update CBT')
  }
  return response.json()
}

export const deleteAdminCBT = async (cbtId: string | number) => {
  const response = await fetch(`/api/admin/cbts/${cbtId}`, { method: 'DELETE' })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete CBT')
  }
}

export const fetchAdminQuestions = async (cbtId: string | number): Promise<Question[]> => {
  const response = await fetch(`/api/admin/cbts/${cbtId}/questions`, { cache: 'no-store' })
  if (!response.ok) throw new Error('Failed to load questions')
  return response.json()
}

export const deleteAdminQuestion = async (cbtId: string | number, questionId: number) => {
  const response = await fetch(`/api/admin/cbts/${cbtId}/questions/${questionId}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete question')
  }
}

export const createAdminQuestions = async (
  cbtId: string | number,
  questions: {
    questionText: string
    questionType: 'mcq' | 'boolean'
    points: number
    explanation: string | null
    options: {
      optionText: string
      isCorrect: boolean
    }[]
  }[],
) => {
  const response = await fetch(`/api/admin/cbts/${cbtId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(questions),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to add questions')
  }
}

export const fetchAdminQuestion = async (
  cbtId: string | number,
  questionId: string | number,
): Promise<Question> => {
  const response = await fetch(`/api/admin/cbts/${cbtId}/questions/${questionId}`, {
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('Question not found')
  return response.json()
}

export const updateAdminQuestion = async (
  cbtId: string | number,
  questionId: string | number,
  data: {
    questionText: string
    questionType: 'mcq' | 'boolean'
    points: number
    explanation: string | null
    options: {
      optionText: string
      isCorrect: boolean
    }[]
  },
) => {
  const response = await fetch(`/api/admin/cbts/${cbtId}/questions/${questionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update question')
  }
}

export const importAdminQuestions = async (
  cbtId: string | number,
  content: string,
): Promise<{ count: number }> => {
  const response = await fetch(`/api/admin/cbts/${cbtId}/questions/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  const result = await response.json()
  if (!response.ok) {
    const error = new Error(result.error || 'Import failed') as Error & { details?: string[] }
    if (result.details) error.details = result.details
    throw error
  }
  return result
}
