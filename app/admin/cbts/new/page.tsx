'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
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

export default function NewCBTPage() {
    const router = useRouter()
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        courseId: '',
        title: '',
        description: '',
        timeLimitMinutes: '',
        passingScore: '70',
    })

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('/api/admin/courses', { cache: 'no-store' })
                if (response.ok) {
                    const data = await response.json()
                    setCourses(data)
                }
            } catch (error) {
                console.error('Error fetching courses:', error)
                toast.error('Failed to load courses')
            } finally {
                setLoading(false)
            }
        }
        fetchCourses()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const response = await fetch('/api/admin/cbts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: parseInt(formData.courseId),
                    title: formData.title,
                    description: formData.description || null,
                    timeLimitMinutes: formData.timeLimitMinutes
                        ? parseInt(formData.timeLimitMinutes)
                        : null,
                    passingScore: parseInt(formData.passingScore),
                }),
            })

            if (response.ok) {
                const cbt = await response.json()
                toast.success('CBT created successfully')
                router.push(`/admin/cbts/${cbt.id}/questions`)
            } else {
                const error = await response.json()
                toast.error(error.error || 'Failed to create CBT')
            }
        } catch (error) {
            console.error('Error creating CBT:', error)
            toast.error('Failed to create CBT')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Loading courses...
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <header className="border-b border-border bg-card">
                <div className="px-6 py-4">
                    <Link href="/admin/cbts">
                        <span className="flex text-sm mb-4 text-primary items-center">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to CBTs
                        </span>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Create New CBT</h1>
                        <p className="text-sm text-muted-foreground">
                            Add a new computer-based test for a course
                        </p>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>CBT Details</CardTitle>
                        <CardDescription>
                            Fill in the details for the new CBT. You can add questions after creating.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="course">Course *</Label>
                                <Select
                                    value={formData.courseId}
                                    onValueChange={value => setFormData({ ...formData, courseId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map(course => (
                                            <SelectItem key={course.id} value={course.id.toString()}>
                                                {course.course_code}: {course.course_title} (
                                                {course.academic_levels?.departments?.short_name} -{' '}
                                                {course.academic_levels?.level_number}L)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">CBT Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Midterm Practice Test"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of this test..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                                    <Input
                                        id="timeLimit"
                                        type="number"
                                        min="1"
                                        value={formData.timeLimitMinutes}
                                        onChange={e =>
                                            setFormData({ ...formData, timeLimitMinutes: e.target.value })
                                        }
                                        placeholder="No limit"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                                    <Input
                                        id="passingScore"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.passingScore}
                                        onChange={e =>
                                            setFormData({ ...formData, passingScore: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={submitting || !formData.courseId || !formData.title}>
                                    {submitting ? 'Creating...' : 'Create CBT'}
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
