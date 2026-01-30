'use client'

import { useEffect, useState } from 'react'
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
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Option {
    optionText: string
    isCorrect: boolean
}

interface QuestionOption {
    id: number
    option_text: string
    is_correct: boolean
    order_index: number
}

interface Question {
    id: number
    question_text: string
    question_type: 'mcq' | 'boolean'
    points: number
    explanation: string | null
    question_options: QuestionOption[]
}

export default function EditQuestionPage() {
    const router = useRouter()
    const params = useParams()
    const cbtId = params.id as string
    const questionId = params.questionId as string

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        questionText: '',
        questionType: 'mcq' as 'mcq' | 'boolean',
        points: '1',
        explanation: '',
    })

    const [options, setOptions] = useState<Option[]>([])
    const [booleanAnswer, setBooleanAnswer] = useState<'true' | 'false'>('true')

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const response = await fetch(
                    `/api/admin/cbts/${cbtId}/questions/${questionId}`,
                    { cache: 'no-store' },
                )
                if (response.ok) {
                    const question: Question = await response.json()
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
                } else {
                    toast.error('Question not found')
                    router.push(`/admin/cbts/${cbtId}/questions`)
                }
            } catch (error) {
                console.error('Error fetching question:', error)
                toast.error('Failed to load question')
            } finally {
                setLoading(false)
            }
        }
        fetchQuestion()
    }, [cbtId, questionId, router])

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

    const handleOptionChange = (index: number, field: 'optionText' | 'isCorrect', value: string | boolean) => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        const validOptions = options.filter(opt => opt.optionText.trim() !== '')
        if (validOptions.length < 2) {
            toast.error('Please provide at least 2 options')
            setSubmitting(false)
            return
        }

        if (!validOptions.some(opt => opt.isCorrect)) {
            toast.error('Please mark one option as correct')
            setSubmitting(false)
            return
        }

        try {
            const response = await fetch(`/api/admin/cbts/${cbtId}/questions/${questionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionText: formData.questionText,
                    questionType: formData.questionType,
                    points: parseInt(formData.points),
                    explanation: formData.explanation || null,
                    options: validOptions,
                }),
            })

            if (response.ok) {
                toast.success('Question updated successfully')
                router.push(`/admin/cbts/${cbtId}/questions`)
            } else {
                const error = await response.json()
                toast.error(error.error || 'Failed to update question')
            }
        } catch (error) {
            console.error('Error updating question:', error)
            toast.error('Failed to update question')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Loading question...
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
                        <p className="text-sm text-muted-foreground">
                            Update question and answer options
                        </p>
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
                                    <Select value={booleanAnswer} onValueChange={(v: 'true' | 'false') => handleBooleanAnswerChange(v)}>
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
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addOption}
                                            >
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
                                <Button type="submit" disabled={submitting || !formData.questionText}>
                                    {submitting ? 'Saving...' : 'Save Changes'}
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
