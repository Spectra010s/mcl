'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Option {
  optionText: string
  isCorrect: boolean
}

interface Question {
  id: string
  questionText: string
  questionType: 'mcq' | 'boolean'
  points: string
  explanation: string
  options: Option[]
  booleanAnswer: 'true' | 'false'
}

export default function NewQuestionPage() {
  const router = useRouter()
  const params = useParams()
  const cbtId = params.cbtId as string

  const [submitting, setSubmitting] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: crypto.randomUUID(),
      questionText: '',
      questionType: 'mcq',
      points: '1',
      explanation: '',
      options: [
        { optionText: '', isCorrect: true },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
      ],
      booleanAnswer: 'true',
    },
  ])

  const addNewQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        questionText: '',
        questionType: 'mcq',
        points: '1',
        explanation: '',
        options: [
          { optionText: '', isCorrect: true },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
        ],
        booleanAnswer: 'true',
      },
    ])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id))
    }
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map(q => {
        if (q.id === id) {
          const updatedQ = { ...q, ...updates }
          if (updates.questionType === 'boolean') {
            updatedQ.options = [
              { optionText: 'True', isCorrect: q.booleanAnswer === 'true' },
              { optionText: 'False', isCorrect: q.booleanAnswer === 'false' },
            ]
          } else if (updates.questionType === 'mcq' && q.questionType === 'boolean') {
            updatedQ.options = [
              { optionText: '', isCorrect: true },
              { optionText: '', isCorrect: false },
              { optionText: '', isCorrect: false },
              { optionText: '', isCorrect: false },
            ]
          }
          return updatedQ
        }
        return q
      }),
    )
  }

  const updateBooleanAnswer = (id: string, answer: 'true' | 'false') => {
    setQuestions(
      questions.map(q => {
        if (q.id === id) {
          return {
            ...q,
            booleanAnswer: answer,
            options: [
              { optionText: 'True', isCorrect: answer === 'true' },
              { optionText: 'False', isCorrect: answer === 'false' },
            ],
          }
        }
        return q
      }),
    )
  }

  const handleOptionChange = (
    qId: string,
    optIndex: number,
    field: 'optionText' | 'isCorrect',
    value: string | boolean,
  ) => {
    setQuestions(
      questions.map(q => {
        if (q.id === qId) {
          const newOptions = [...q.options]
          if (field === 'isCorrect' && value === true) {
            newOptions.forEach((opt, i) => {
              opt.isCorrect = i === optIndex
            })
          } else {
            newOptions[optIndex] = { ...newOptions[optIndex], [field]: value }
          }
          return { ...q, options: newOptions }
        }
        return q
      }),
    )
  }

  const addOption = (qId: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id === qId && q.options.length < 6) {
          return { ...q, options: [...q.options, { optionText: '', isCorrect: false }] }
        }
        return q
      }),
    )
  }

  const removeOptionFromQuestion = (qId: string, optIndex: number) => {
    setQuestions(
      questions.map(q => {
        if (q.id === qId && q.options.length > 2) {
          const newOptions = q.options.filter((_, i) => i !== optIndex)
          if (!newOptions.some(opt => opt.isCorrect)) {
            newOptions[0].isCorrect = true
          }
          return { ...q, options: newOptions }
        }
        return q
      }),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Validation
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      const qNum = i + 1

      if (!q.questionText.trim()) {
        toast.error(`Question ${qNum} text is required`)
        setSubmitting(false)
        return
      }

      const validOptions = q.options.filter(opt => opt.optionText.trim() !== '')
      if (validOptions.length < 2) {
        toast.error(`Question ${qNum} needs at least 2 options`)
        setSubmitting(false)
        return
      }

      if (!validOptions.some(opt => opt.isCorrect)) {
        toast.error(`Please mark a correct answer for Question ${qNum}`)
        setSubmitting(false)
        return
      }
    }

    try {
      const questionsToSubmit = questions.map(q => ({
        questionText: q.questionText,
        questionType: q.questionType,
        points: parseInt(q.points),
        explanation: q.explanation || null,
        options: q.options.filter(opt => opt.optionText.trim() !== ''),
      }))

      const response = await fetch(`/api/admin/cbts/${cbtId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionsToSubmit),
      })

      if (response.ok) {
        toast.success(`${questions.length} question(s) added successfully`)
        router.push(`/admin/cbts/${cbtId}/questions`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add questions')
      }
    } catch (error) {
      console.error('Error adding questions:', error)
      toast.error('Failed to add questions')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-16 z-30">
        <div className="px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
          <div>
            <Link href={`/admin/cbts/${cbtId}/questions`}>
              <span className="flex text-sm mb-1 text-primary items-center hover:underline cursor-pointer">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Questions
              </span>
            </Link>
            <h1 className="text-2xl font-bold">Add Questions</h1>
            <p className="text-sm text-muted-foreground">Create a new questions for this CBT</p>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || questions.some(q => !q.questionText)}
              className="bg-primary hover:bg-primary/90"
            >
              {submitting
                ? 'Creating...'
                : `Create ${questions.length} Question${questions.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-3xl mx-auto space-y-8 pb-32">
        {questions.map((q, qIndex) => (
          <Card key={q.id} className="relative group">
            <div className="absolute -left-12 top-0 text-3xl font-bold text-muted/30 hidden lg:block">
              #{qIndex + 1}
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Question {qIndex + 1}</CardTitle>
                <CardDescription>Fill in the question and answer options.</CardDescription>
              </div>
              {questions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQuestion(q.id)}
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor={`questionText-${q.id}`}>Question *</Label>
                <Textarea
                  id={`questionText-${q.id}`}
                  value={q.questionText}
                  onChange={e => updateQuestion(q.id, { questionText: e.target.value })}
                  placeholder="Enter your question here..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`questionType-${q.id}`}>Question Type</Label>
                  <Select
                    value={q.questionType}
                    onValueChange={(value: 'mcq' | 'boolean') =>
                      updateQuestion(q.id, { questionType: value })
                    }
                  >
                    <SelectTrigger id={`questionType-${q.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">Multiple Choice</SelectItem>
                      <SelectItem value="boolean">True/False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`points-${q.id}`}>Points</Label>
                  <Input
                    id={`points-${q.id}`}
                    type="number"
                    min="1"
                    value={q.points}
                    onChange={e => updateQuestion(q.id, { points: e.target.value })}
                    required
                  />
                </div>
              </div>

              {q.questionType === 'boolean' ? (
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <Select
                    value={q.booleanAnswer}
                    onValueChange={(v: 'true' | 'false') => updateBooleanAnswer(q.id, v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Answer Options</Label>
                    {q.options.length < 4 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(q.id)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Option
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3">
                    {q.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex gap-3 items-center">
                        <input
                          type="radio"
                          name={`correctOption-${q.id}`}
                          checked={option.isCorrect}
                          onChange={() => handleOptionChange(q.id, optIndex, 'isCorrect', true)}
                          className="w-4 h-4 text-primary accent-primary"
                        />
                        <Input
                          value={option.optionText}
                          onChange={e =>
                            handleOptionChange(q.id, optIndex, 'optionText', e.target.value)
                          }
                          placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                          className="flex-1"
                        />
                        {q.options.length > 3 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOptionFromQuestion(q.id, optIndex)}
                            className="text-muted-foreground hover:text-destructive h-9 w-9"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Select the radio button next to the correct answer.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor={`explanation-${q.id}`}>Explanation (optional)</Label>
                <Textarea
                  id={`explanation-${q.id}`}
                  value={q.explanation}
                  onChange={e => updateQuestion(q.id, { explanation: e.target.value })}
                  placeholder="Provide context for the correct answer..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full py-8 border-2 border-dashed hover:border-primary hover:bg-primary/5 hover:text-primary transition-all group"
          onClick={addNewQuestion}
        >
          <Plus className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
          <span className="text-lg">Add Another Question</span>
        </Button>

        <div className="flex gap-4 pt-8 justify-center">
          <Button
            type="button"
            className="px-8 h-12 text-lg"
            onClick={handleSubmit}
            disabled={submitting || questions.some(q => !q.questionText)}
          >
            {submitting
              ? 'Creating...'
              : `Create ${questions.length} Question${questions.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      </main>
    </div>
  )
}
