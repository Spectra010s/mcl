'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import * as adminCbtsApi from '@/lib/api/admin/cbts'
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
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader } from '@/components/ui/loader'

// Types are now handled by adminCbtsApi
interface Option {
  optionText: string
  isCorrect: boolean
}

export default function EditQuestionPage() {
  const router = useRouter()
  const params = useParams()
  const cbtId = params.cbtId as string
  const questionId = params.questionId as string

  const [formData, setFormData] = useState({
    questionText: '',
    questionType: 'mcq' as 'mcq' | 'boolean',
    points: '1',
    explanation: '',
  })

  const [options, setOptions] = useState<Option[]>([])
  const [booleanAnswer, setBooleanAnswer] = useState<'true' | 'false'>('true')

  const formInitializedRef = useRef(false)

  const { data: question, isLoading } = useQuery<adminCbtsApi.Question>({
    queryKey: ['admin', 'cbts', cbtId, 'questions', questionId],
    queryFn: () => adminCbtsApi.fetchAdminQuestion(cbtId, questionId),
  })

  useEffect(() => {
    if (!question || formInitializedRef.current) return
    setFormData({
      questionText: question.question_text,
      questionType: question.question_type,
      points: question.points.toString(),
      explanation: question.explanation || '',
    })

    const loadedOptions = question.question_options
      .sort((a, b) => a.order_index - b.order_index)
      .map(opt => ({
        optionText: opt.option_text,
        isCorrect: opt.is_correct,
      }))
    setOptions(loadedOptions)

    if (question.question_type === 'boolean') {
      const trueOption = loadedOptions.find(opt => opt.optionText === 'True')
      setBooleanAnswer(trueOption?.isCorrect ? 'true' : 'false')
    }

    formInitializedRef.current = true
  }, [question])

  useEffect(() => {
    if (isLoading || question) return
    toast.error('Question not found')
    router.push(`/admin/cbts/${cbtId}/questions`)
  }, [cbtId, isLoading, question, router])

  const updateMutation = useMutation({
    mutationFn: () => {
      const validOptions = options.filter(opt => opt.optionText.trim() !== '')
      if (validOptions.length < 2) {
        throw new Error('Please provide at least 2 options')
      }

      if (!validOptions.some(opt => opt.isCorrect)) {
        throw new Error('Please mark one option as correct')
      }

      return adminCbtsApi.updateAdminQuestion(cbtId, questionId, {
        questionText: formData.questionText,
        questionType: formData.questionType,
        points: parseInt(formData.points),
        explanation: formData.explanation || null,
        options: validOptions,
      })
    },
    onSuccess: () => {
      toast.success('Question updated successfully')
      router.push(`/admin/cbts/${cbtId}/questions`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update question')
    },
  })

  const handleQuestionTypeChange = (type: 'mcq' | 'boolean') => {
    setFormData({ ...formData, questionType: type })
    if (type === 'boolean') {
      setOptions([
        { optionText: 'True', isCorrect: booleanAnswer === 'true' },
        { optionText: 'False', isCorrect: booleanAnswer === 'false' },
      ])
    } else if (options.length < 2) {
      setOptions([
        { optionText: '', isCorrect: true },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
      ])
    }
  }

  const handleBooleanAnswerChange = (answer: 'true' | 'false') => {
    setBooleanAnswer(answer)
    setOptions([
      { optionText: 'True', isCorrect: answer === 'true' },
      { optionText: 'False', isCorrect: answer === 'false' },
    ])
  }

  const handleOptionChange = (
    index: number,
    field: 'optionText' | 'isCorrect',
    value: string | boolean,
  ) => {
    const newOptions = [...options]
    if (field === 'isCorrect' && value === true) {
      newOptions.forEach((opt, i) => {
        opt.isCorrect = i === index
      })
    } else {
      newOptions[index] = { ...newOptions[index], [field]: value }
    }
    setOptions(newOptions)
  }

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, { optionText: '', isCorrect: false }])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      if (!newOptions.some(opt => opt.isCorrect)) {
        newOptions[0].isCorrect = true
      }
      setOptions(newOptions)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader size={32} className="text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading question...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <Link href={`/admin/cbts/${cbtId}/questions`}>
            <span className="flex text-sm mb-4 text-primary items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Questions
            </span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Question</h1>
            <p className="text-sm text-muted-foreground">Update question and answer options</p>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Question Details</CardTitle>
            <CardDescription>Update the question and answer options.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="questionText">Question *</Label>
                <Textarea
                  id="questionText"
                  value={formData.questionText}
                  onChange={e => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="Enter your question here..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="questionType">Question Type</Label>
                  <Select
                    value={formData.questionType}
                    onValueChange={(value: 'mcq' | 'boolean') => handleQuestionTypeChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">Multiple Choice</SelectItem>
                      <SelectItem value="boolean">True/False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    value={formData.points}
                    onChange={e => setFormData({ ...formData, points: e.target.value })}
                    required
                  />
                </div>
              </div>

              {formData.questionType === 'boolean' ? (
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <Select
                    value={booleanAnswer}
                    onValueChange={(v: 'true' | 'false') => handleBooleanAnswerChange(v)}
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
                    {options.length < 6 && (
                      <Button type="button" variant="outline" size="sm" onClick={addOption}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Option
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {options.map((option, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={option.isCorrect}
                          onChange={() => handleOptionChange(index, 'isCorrect', true)}
                          className="w-4 h-4 text-primary"
                        />
                        <Input
                          value={option.optionText}
                          onChange={e => handleOptionChange(index, 'optionText', e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          className="flex-1"
                        />
                        {options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeOption(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select the radio button next to the correct answer.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation (optional)</Label>
                <Textarea
                  id="explanation"
                  value={formData.explanation}
                  onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Explanation shown after the test..."
                  rows={2}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={updateMutation.isPending || !formData.questionText}>
                  {updateMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader size={16} className="text-white" />
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
