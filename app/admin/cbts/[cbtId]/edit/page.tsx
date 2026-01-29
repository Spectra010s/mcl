'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface CBT {
    id: number
    title: string
    description: string | null
    time_limit_minutes: number | null
    passing_score: number
    is_active: boolean
    courses: {
        id: number
        course_code: string
        course_title: string
    }
}

export default function EditCBTPage() {
    const router = useRouter()
    const params = useParams()
    const cbtId = params.cbtId as string

    const [cbt, setCbt] = useState<CBT | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        timeLimitMinutes: '',
        passingScore: '70',
    })

    useEffect(() => {
        const fetchCBT = async () => {
            try {
                const response = await fetch(`/api/admin/cbts/${cbtId}`, { cache: 'no-store' })
                if (response.ok) {
                    const data = await response.json()
                    setCbt(data)
                    setFormData({
                        title: data.title,
                        description: data.description || '',
                        timeLimitMinutes: data.time_limit_minutes?.toString() || '',
                        passingScore: data.passing_score.toString(),
                    })
                } else {
                    toast.error('CBT not found')
                    router.push('/admin/cbts')
                }
            } catch (error) {
                console.error('Error fetching CBT:', error)
                toast.error('Failed to load CBT')
            } finally {
                setLoading(false)
            }
        }
        fetchCBT()
    }, [cbtId, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const response = await fetch(`/api/admin/cbts/${cbtId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description || null,
                    time_limit_minutes: formData.timeLimitMinutes
                        ? parseInt(formData.timeLimitMinutes)
                        : null,
                    passing_score: parseInt(formData.passingScore),
                }),
            })

            if (response.ok) {
                toast.success('CBT updated successfully')
                router.push('/admin/cbts')
            } else {
                const error = await response.json()
                toast.error(error.error || 'Failed to update CBT')
            }
        } catch (error) {
            console.error('Error updating CBT:', error)
            toast.error('Failed to update CBT')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">Loading CBT...</div>
        )
    }

    if (!cbt) {
        return null
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
                        <h1 className="text-2xl font-bold">Edit CBT</h1>
                        <p className="text-sm text-muted-foreground">
                            {cbt.courses.course_code}: {cbt.courses.course_title}
                        </p>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>CBT Details</CardTitle>
                        <CardDescription>Update the CBT settings below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                <Button type="submit" disabled={submitting || !formData.title}>
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
