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
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Option {
    optionText: string
    isCorrect: boolean
}

export default function NewQuestionPage() {
    const router = useRouter()
    const params = useParams()
    const cbtId = params.cbtId as string

    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        questionText: '',
        questionType: 'mcq' as 'mcq' | 'boolean',
        points: '1',
        explanation: '',
    })

    const [options, setOptions] = useState<Option[]>([
        { optionText: '', isCorrect: true },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
    ])

    const [booleanAnswer, setBooleanAnswer] = useState<'true' | 'false'>('true')

    const handleQuestionTypeChange = (type: 'mcq' | 'boolean') => {
        setFormData({ ...formData, questionType: type })
        if (type === 'boolean') {
            setOptions([
                { optionText: 'True', isCorrect: booleanAnswer === 'true' },
                { optionText: 'False', isCorrect: booleanAnswer === 'false' },
            ])
        } else {
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
            // Only one correct answer
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
            // Ensure at least one is correct
            if (!newOptions.some(opt => opt.isCorrect)) {
                newOptions[0].isCorrect = true
            }
            setOptions(newOptions)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        // Validation
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
            const response = await fetch(`/api/admin/cbts/${cbtId}/questions`, {
                method: 'POST',
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
                toast.success('Question added successfully')
                router.push(`/admin/cbts/${cbtId}/questions`)
            } else {
                const error = await response.json()
                toast.error(error.error || 'Failed to add question')
            }
        } catch (error) {
            console.error('Error adding question:', error)
            toast.error('Failed to add question')
        } finally {
            setSubmitting(false)
        }
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
                        <h1 className="text-2xl font-bold">Add Question</h1>
                        <p className="text-sm text-muted-foreground">
                            Create a new question for this CBT
                        </p>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Question Details</CardTitle>
                        <CardDescription>Fill in the question and answer options.</CardDescription>
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
                                    {submitting ? 'Adding...' : 'Add Question'}
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
