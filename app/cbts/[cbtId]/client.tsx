'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  FileQuestion,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trophy,
  RotateCcw,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface Course {
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

interface CBT {
  id: number
  title: string
  description: string | null
  time_limit_minutes: number | null
  passing_score: number
  courses: Course
}

interface Attempt {
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

interface QuestionOption {
  id: number
  option_text: string
}

interface Question {
  shuffled_index: number
  question_id: number
  question_text: string
  question_type: string
  options: QuestionOption[]
}

interface AttemptData {
  attempt: Attempt & { cbts: CBT }
  questions: Question[]
  answers: Record<string, string>
}

interface ReviewOption {
  id: number
  option_text: string
  is_correct: boolean
}

interface ReviewItem {
  order_index: number
  question_text: string
  explanation: string | null
  user_choice_id: number | null
  user_choice_text: string | null
  is_user_correct: boolean
  options: ReviewOption[]
}

type ViewState = 'pre-test' | 'testing' | 'results' | 'review'

interface CBTClientProps {
  cbt: CBT
  attempts: Attempt[]
  userId: string
}

export default function CBTClient({ cbt, attempts: initialAttempts, userId }: CBTClientProps) {
  const router = useRouter()
  const [viewState, setViewState] = useState<ViewState>('pre-test')
  const [attempts, setAttempts] = useState<Attempt[]>(initialAttempts)
  const [currentAttempt, setCurrentAttempt] = useState<Attempt | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [reviewData, setReviewData] = useState<ReviewItem[]>([])

  // Check for incomplete attempt on mount
  useEffect(() => {
    const incompleteAttempt = attempts.find(a => !a.completed_at)
    if (incompleteAttempt) {
      resumeAttempt(incompleteAttempt.id)
    }
  }, [])

  // Timer effect
  useEffect(() => {
    if (viewState !== 'testing' || timeRemaining === null) return

    if (timeRemaining <= 0) {
      handleSubmit()
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => (prev !== null ? prev - 1 : null))
    }, 1000)

    return () => clearInterval(timer)
  }, [viewState, timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const resumeAttempt = async (attemptId: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/cbts/attempts/${attemptId}`)
      if (response.ok) {
        const data: AttemptData = await response.json()
        if (data.attempt.completed_at) {
          setCurrentAttempt(data.attempt)
          setViewState('results')
        } else {
          setCurrentAttempt(data.attempt)
          setQuestions(data.questions)
          setAnswers(data.answers)

          // Calculate remaining time
          if (cbt.time_limit_minutes) {
            const startTime = new Date(data.attempt.started_at).getTime()
            const elapsed = Math.floor((Date.now() - startTime) / 1000)
            const remaining = cbt.time_limit_minutes * 60 - elapsed
            setTimeRemaining(Math.max(0, remaining))
          }

          setViewState('testing')
        }
      }
    } catch (error) {
      console.error('Error resuming attempt:', error)
      toast.error('Failed to resume test')
    } finally {
      setLoading(false)
    }
  }

  const startTest = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/cbts/${cbt.id}/attempts`, {
        method: 'POST',
      })

      if (response.ok) {
        const attempt = await response.json()
        setCurrentAttempt(attempt)

        // Fetch questions
        const questionsRes = await fetch(`/api/cbts/attempts/${attempt.id}`)
        if (questionsRes.ok) {
          const data: AttemptData = await questionsRes.json()
          setQuestions(data.questions)
          setAnswers({})

          if (cbt.time_limit_minutes) {
            setTimeRemaining(cbt.time_limit_minutes * 60)
          }

          setViewState('testing')
        }
      } else if (response.status === 409) {
        const data = await response.json()
        resumeAttempt(data.attemptId)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to start test')
      }
    } catch (error) {
      console.error('Error starting test:', error)
      toast.error('Failed to start test')
    } finally {
      setLoading(false)
    }
  }

  const saveAnswer = async (questionId: number, optionId: number) => {
    if (!currentAttempt) return

    setAnswers(prev => ({ ...prev, [questionId]: optionId.toString() }))

    try {
      await fetch(`/api/cbts/attempts/${currentAttempt.id}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          selectedOptionId: optionId,
        }),
      })
    } catch (error) {
      console.error('Error saving answer:', error)
    }
  }

  const handleSubmit = async () => {
    if (!currentAttempt) return

    setLoading(true)
    setSubmitDialogOpen(false)

    try {
      const response = await fetch(`/api/cbts/attempts/${currentAttempt.id}/submit`, {
        method: 'POST',
      })

      if (response.ok) {
        const updatedAttempt = await response.json()
        setCurrentAttempt(updatedAttempt)
        setAttempts(prev => prev.map(a => (a.id === updatedAttempt.id ? updatedAttempt : a)))
        setViewState('results')
        toast.success('Test submitted!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit test')
      }
    } catch (error) {
      console.error('Error submitting test:', error)
      toast.error('Failed to submit test')
    } finally {
      setLoading(false)
    }
  }

  const loadReview = async () => {
    if (!currentAttempt) return

    setLoading(true)
    try {
      const response = await fetch(`/api/cbts/attempts/${currentAttempt.id}/review`)
      if (response.ok) {
        const data = await response.json()
        setReviewData(data.review)
        setViewState('review')
      }
    } catch (error) {
      console.error('Error loading review:', error)
      toast.error('Failed to load review')
    } finally {
      setLoading(false)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const answeredCount = Object.keys(answers).length
  const completedAttempts = attempts.filter(a => a.completed_at)
  const bestScore =
    completedAttempts.length > 0 ? Math.max(...completedAttempts.map(a => a.score || 0)) : null

  // Pre-test view
  if (viewState === 'pre-test') {
    return (
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 md:px-6">
        <Link href="/cbts" className="flex items-center gap-2 text-primary hover:underline mb-6">
          <ChevronLeft className="w-4 h-4" />
          Back to Tests
        </Link>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <GraduationCap className="w-5 h-5" />
              <span>
                {cbt.courses.course_code}: {cbt.courses.course_title}
              </span>
            </div>
            <CardTitle className="text-3xl">{cbt.title}</CardTitle>
            {cbt.description && (
              <CardDescription className="text-base mt-2">{cbt.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{cbt.time_limit_minutes || '∞'}</div>
                <div className="text-sm text-muted-foreground">
                  {cbt.time_limit_minutes ? 'Minutes' : 'No Limit'}
                </div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{cbt.passing_score}%</div>
                <div className="text-sm text-muted-foreground">To Pass</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <RotateCcw className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{completedAttempts.length}</div>
                <div className="text-sm text-muted-foreground">Attempts</div>
              </div>
            </div>

            {bestScore !== null && (
              <div className="mb-6 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Your Best Score</span>
                  <Badge variant={bestScore >= cbt.passing_score ? 'default' : 'secondary'}>
                    {bestScore}%
                  </Badge>
                </div>
              </div>
            )}

            <Button size="lg" className="w-full" onClick={startTest} disabled={loading}>
              {loading ? 'Loading...' : 'Start Test'}
            </Button>
          </CardContent>
        </Card>

        {completedAttempts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Previous Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {completedAttempts.slice(0, 5).map(attempt => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {attempt.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium">Attempt #{attempt.attempt_number}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(attempt.completed_at!).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant={attempt.passed ? 'default' : 'secondary'}>
                      {attempt.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    )
  }

  // Testing view
  if (viewState === 'testing' && currentQuestion) {
    return (
      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 md:px-6">
        {/* Timer and Progress Bar */}
        <div className="sticky top-0 bg-background/95 backdrop-blur z-10 pb-4 mb-6 border-b">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-semibold truncate">{cbt.title}</h1>
            {timeRemaining !== null && (
              <Badge
                variant={
                  timeRemaining < 60 ? 'destructive' : timeRemaining < 300 ? 'secondary' : 'outline'
                }
                className={`text-lg px-3 py-1 ${timeRemaining < 60 ? 'animate-pulse' : ''}`}
              >
                <Clock className="w-4 h-4 mr-2" />
                {formatTime(timeRemaining)}
              </Badge>
            )}
          </div>

          {/* Question Navigation */}
          <div className="flex flex-wrap gap-2">
            {questions.map((q, index) => (
              <button
                key={q.question_id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-primary text-primary-foreground'
                    : answers[q.question_id]
                      ? 'bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/50'
                      : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardDescription>
              Question {currentQuestionIndex + 1} of {questions.length}
            </CardDescription>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.question_text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={option.id}
                  onClick={() => saveAnswer(currentQuestion.question_id, option.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    answers[currentQuestion.question_id] === option.id.toString()
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option.option_text}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            {answeredCount} of {questions.length} answered
          </div>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => setSubmitDialogOpen(true)} disabled={loading}>
              Submit Test
            </Button>
          )}
        </div>

        {/* Submit Confirmation Dialog */}
        <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Test?</AlertDialogTitle>
              <AlertDialogDescription>
                {answeredCount < questions.length ? (
                  <span className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    You have {questions.length - answeredCount} unanswered question(s).
                  </span>
                ) : (
                  'You have answered all questions. Are you ready to submit?'
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue Test</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    )
  }

  // Results view
  if (viewState === 'results' && currentAttempt) {
    const passed = currentAttempt.passed
    const score = currentAttempt.score || 0

    return (
      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 md:px-6">
        <Card className="text-center">
          <CardHeader>
            <div
              className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                passed ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}
            >
              {passed ? (
                <Trophy className="w-10 h-10 text-green-500" />
              ) : (
                <XCircle className="w-10 h-10 text-red-500" />
              )}
            </div>
            <CardTitle className="text-3xl">
              {passed ? 'Congratulations!' : 'Keep Practicing!'}
            </CardTitle>
            <CardDescription className="text-lg">
              {passed ? 'You passed the test!' : `You need ${cbt.passing_score}% to pass.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold mb-2">{score}%</div>
            <div className="text-muted-foreground mb-6">
              {currentAttempt.total_points_earned} / {currentAttempt.total_points_possible} points
            </div>

            {currentAttempt.time_taken_seconds && (
              <div className="text-sm text-muted-foreground mb-6">
                Completed in {Math.floor(currentAttempt.time_taken_seconds / 60)}m{' '}
                {currentAttempt.time_taken_seconds % 60}s
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button onClick={loadReview} disabled={loading}>
                {loading ? 'Loading...' : 'Review Answers'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setViewState('pre-test')
                  setCurrentAttempt(null)
                  setQuestions([])
                  setAnswers({})
                }}
              >
                Try Again
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/cbts">Back to Tests</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  // Review view
  if (viewState === 'review') {
    return (
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 md:px-6">
        <Button variant="ghost" onClick={() => setViewState('results')} className="mb-6">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Results
        </Button>

        <h1 className="text-2xl font-bold mb-6">Answer Review</h1>

        <div className="space-y-6">
          {reviewData.map((item, index) => (
            <Card
              key={index}
              className={item.is_user_correct ? 'border-green-500/50' : 'border-red-500/50'}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  {item.is_user_correct ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mt-1 shrink-0" />
                  )}
                  <div className="flex-1">
                    <CardDescription>Question {item.order_index}</CardDescription>
                    <CardTitle className="text-base font-medium leading-relaxed">
                      {item.question_text}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {item.options.map((option, optIndex) => {
                    const isSelected = option.id === item.user_choice_id
                    const isCorrect = option.is_correct

                    let className = 'w-full text-left p-3 rounded-lg border transition-all '

                    if (isCorrect) {
                      className +=
                        'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 font-medium'
                    } else if (isSelected && !isCorrect) {
                      className +=
                        'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 font-medium'
                    } else {
                      className += 'border-border opacity-70'
                    }

                    return (
                      <div key={option.id} className={className}>
                        <span className="mr-3">{String.fromCharCode(65 + optIndex)}.</span>
                        {option.option_text}
                        {isSelected && (
                          <span className="ml-2 text-xs uppercase tracking-wider font-bold">
                            (Your Answer)
                          </span>
                        )}
                      </div>
                    )
                  })}

                  {item.explanation && (
                    <div className="mt-4 p-3 rounded bg-muted text-muted-foreground italic text-sm">
                      <span className="font-semibold not-italic block mb-1">Explanation:</span>
                      {item.explanation}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    )
  }

  // Loading state
  return (
    <main className="flex-1 flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </main>
  )
}
