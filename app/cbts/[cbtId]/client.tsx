'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as cbtsApi from '@/lib/api/cbts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
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

interface CBTClientProps {
  cbt: cbtsApi.CBT
  attempts: cbtsApi.Attempt[]
  userId: string
}

export default function CBTClient({ cbt, attempts: initialAttempts }: CBTClientProps) {
  const queryClient = useQueryClient()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [now, setNow] = useState<number>(() => Date.now())
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [completedAttempt, setCompletedAttempt] = useState<cbtsApi.Attempt | null>(null)
  const saveAnswerTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingAnswerRef = useRef<{ questionId: number; optionId: number } | null>(null)

  // Queries
  const { data: attempts = initialAttempts } = useQuery<cbtsApi.Attempt[]>({
    queryKey: ['cbts', cbt.id, 'attempts'],
    queryFn: () => cbtsApi.fetchCBTAttempts(cbt.id),
    initialData: initialAttempts,
  })

  // Derive Active Attempt
  const inProgressAttempt = useMemo(() => attempts.find(a => !a.completed_at), [attempts])
  const activeAttemptId = inProgressAttempt?.id || null

  const { data: attemptData, isLoading: loadingAttempt } = useQuery({
    queryKey: ['cbts', 'attempts', activeAttemptId],
    queryFn: () => cbtsApi.fetchAttempt(activeAttemptId!),
    enabled: !!activeAttemptId,
  })

  // Derive View State
  const currentViewState = useMemo(() => {
    if (isReviewMode) return 'review'
    if (completedAttempt) return 'results'
    if (attemptData?.attempt.completed_at) return 'results'
    if (activeAttemptId) return 'testing'
    return 'pre-test'
  }, [isReviewMode, completedAttempt, attemptData, activeAttemptId])

  // Derive Timer
  const timeRemaining = useMemo(() => {
    if (currentViewState === 'testing' && attemptData && cbt.time_limit_minutes) {
      const startTime = new Date(attemptData.attempt.started_at).getTime()
      const elapsed = Math.floor((now - startTime) / 1000)
      return Math.max(0, cbt.time_limit_minutes * 60 - elapsed)
    }
    return null
  }, [currentViewState, attemptData, cbt.time_limit_minutes, now])

  const { data: reviewData = [], isFetching: isFetchingReview } = useQuery({
    queryKey: ['cbts', 'review', completedAttempt?.id],
    queryFn: () => cbtsApi.fetchCBTReview(completedAttempt!.id),
    enabled: currentViewState === 'review' && !!completedAttempt?.id,
  })

  const questions = attemptData?.questions || []
  const currentAttempt = attemptData?.attempt || null
  const answers = attemptData?.answers || {}

  // 3. Mutations
  const startMutation = useMutation({
    mutationFn: () => cbtsApi.startCBTAttempt(cbt.id),
    onSuccess: () => {
      setCompletedAttempt(null)
      queryClient.invalidateQueries({ queryKey: ['cbts', cbt.id, 'attempts'] })
    },
    onError: (error: Error & { status?: number; attemptId?: number }) => {
      console.error('Error starting test:', error)
      if (error.status !== 409) {
        toast.error('Could not start the test. Please try again.')
      } else if (error.attemptId) {
        const conflictId = error.attemptId
        queryClient.fetchQuery({
          queryKey: ['cbts', 'attempts', conflictId],
          queryFn: () => cbtsApi.fetchAttempt(conflictId),
        })
      }
      queryClient.invalidateQueries({ queryKey: ['cbts', cbt.id, 'attempts'] })
    },
  })

  const saveAnswerMutation = useMutation({
    mutationFn: ({ questionId, optionId }: { questionId: number; optionId: number }) =>
      cbtsApi.saveCBTAnswer(activeAttemptId!, questionId, optionId),
    onMutate: async ({ questionId, optionId }) => {
      const queryKey = ['cbts', 'attempts', activeAttemptId]
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<cbtsApi.AttemptData>(queryKey)

      if (previousData) {
        queryClient.setQueryData<cbtsApi.AttemptData>(queryKey, {
          ...previousData,
          answers: { ...previousData.answers, [questionId]: optionId.toString() },
        })
      }
      return { previousData }
    },
    onError: (error, _variables, context) => {
      console.error('Error saving answer:', error)
      if (context?.previousData) {
        queryClient.setQueryData(['cbts', 'attempts', activeAttemptId], context.previousData)
      }
      toast.error('Could not save answer. Please check your connection.')
    },
  })

  const submitMutation = useMutation({
    mutationFn: () => cbtsApi.submitCBTAttempt(activeAttemptId!),
    onSuccess: data => {
      setCompletedAttempt(data)
      queryClient.invalidateQueries({ queryKey: ['cbts', cbt.id, 'attempts'] })
      queryClient.invalidateQueries({ queryKey: ['cbts', 'attempts', activeAttemptId] })
      setSubmitDialogOpen(false)
      toast.success('Test submitted!')
    },
    onError: (error: Error) => {
      console.error('Error submitting test:', error)
      toast.error('Could not submit the test. Please try again.')
    },
  })

  // Essential Timer Ticker
  useEffect(() => {
    if (currentViewState !== 'testing') return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [currentViewState])

  // Clean up pending debounced save on unmount
  useEffect(() => {
    return () => {
      if (saveAnswerTimeoutRef.current) {
        clearTimeout(saveAnswerTimeoutRef.current)
      }
    }
  }, [])

  // Auto-submit on time up
  useEffect(() => {
    if (timeRemaining === 0 && currentViewState === 'testing') {
      submitMutation.mutate()
    }
  }, [timeRemaining, currentViewState, submitMutation])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const loading =
    startMutation.isPending || submitMutation.isPending || loadingAttempt || isFetchingReview
  const currentQuestion = questions[currentQuestionIndex] as cbtsApi.Question | undefined
  const answeredCount = Object.keys(answers).length
  const completedAttempts = attempts.filter(a => a.completed_at)
  const bestScore =
    completedAttempts.length > 0 ? Math.max(...completedAttempts.map(a => a.score || 0)) : null

  const queueSaveAnswer = useCallback(
    (questionId: number, optionId: number) => {
      pendingAnswerRef.current = { questionId, optionId }
      if (saveAnswerTimeoutRef.current) {
        clearTimeout(saveAnswerTimeoutRef.current)
      }
      saveAnswerTimeoutRef.current = setTimeout(() => {
        const pending = pendingAnswerRef.current
        if (pending) {
          saveAnswerMutation.mutate(pending)
        }
        saveAnswerTimeoutRef.current = null
      }, 500)
    },
    [saveAnswerMutation],
  )

  const handleAnswerClick = useCallback(
    (questionId: number, optionId: number) => {
      // Immediate UI update for responsiveness
      const queryKey = ['cbts', 'attempts', activeAttemptId]
      queryClient.setQueryData<cbtsApi.AttemptData>(queryKey, previousData => {
        if (!previousData) return previousData
        return {
          ...previousData,
          answers: { ...previousData.answers, [questionId]: optionId.toString() },
        }
      })
      queueSaveAnswer(questionId, optionId)
    },
    [activeAttemptId, queryClient, queueSaveAnswer],
  )

  // Pre-test View
  if (currentViewState === 'pre-test') {
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
              <div className="mb-6 p-4 border rounded-lg flex items-center justify-between">
                <span className="text-muted-foreground">Your Best Score</span>
                <Badge variant={bestScore >= cbt.passing_score ? 'default' : 'secondary'}>
                  {bestScore}%
                </Badge>
              </div>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={() => startMutation.mutate()}
              disabled={loading}
            >
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

  // Testing View
  if (currentViewState === 'testing' && currentQuestion) {
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
                  onClick={() => handleAnswerClick(currentQuestion.question_id, option.id)}
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
              <AlertDialogAction onClick={() => submitMutation.mutate()}>Submit</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    )
  }

  // Results View
  if (currentViewState === 'results' && (currentAttempt || completedAttempt)) {
    const resultsAttempt = completedAttempt ?? currentAttempt!
    const passed = resultsAttempt.passed
    const score = resultsAttempt.score || 0
    return (
      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 md:px-6">
        <Card className="text-center">
          <CardHeader>
            <div
              className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${passed ? 'bg-green-500/20' : 'bg-red-500/20'}`}
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
              {resultsAttempt.total_points_earned} / {resultsAttempt.total_points_possible} points
            </div>
            {resultsAttempt.time_taken_seconds && (
              <div className="text-sm text-muted-foreground mb-6">
                Completed in {Math.floor(resultsAttempt.time_taken_seconds / 60)}m{' '}
                {resultsAttempt.time_taken_seconds % 60}s
              </div>
            )}
            <div className="flex flex-col gap-3">
              <Button onClick={() => setIsReviewMode(true)} disabled={loading}>
                {loading ? 'Loading...' : 'Review Answers'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsReviewMode(false)
                  setCompletedAttempt(null)
                  queryClient.invalidateQueries({ queryKey: ['cbts', cbt.id, 'attempts'] })
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

  // Review View
  if (isReviewMode) {
    return (
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 md:px-6">
        <Button variant="ghost" onClick={() => setIsReviewMode(false)} className="mb-6">
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
              <CardHeader className="pb-3 text-left">
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
                    let bgColor = 'bg-transparent'
                    let borderColor = 'border-border'
                    let textColor = 'text-foreground'

                    if (isCorrect) {
                      bgColor = 'bg-green-500/10'
                      borderColor = 'border-green-500'
                      textColor = 'text-green-700 dark:text-green-400 font-medium'
                    } else if (isSelected && !isCorrect) {
                      bgColor = 'bg-red-500/10'
                      borderColor = 'border-red-500'
                      textColor = 'text-red-700 dark:text-red-400 font-medium'
                    } else {
                      borderColor = 'border-border'
                      textColor = 'text-muted-foreground opacity-70'
                    }

                    return (
                      <div
                        key={option.id}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${bgColor} ${borderColor} ${textColor}`}
                      >
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
