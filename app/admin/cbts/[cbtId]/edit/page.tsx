'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import * as adminCbtsApi from '@/lib/api/admin/cbts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader } from '@/components/ui/loader'

// Types are now handled by adminCbtsApi

export default function EditCBTPage() {
  const router = useRouter()
  const params = useParams()
  const cbtId = params.cbtId as string

  const { data: cbt, isLoading } = useQuery<adminCbtsApi.CBT>({
    queryKey: ['admin', 'cbts', cbtId],
    queryFn: () => adminCbtsApi.fetchAdminCBT(cbtId),
  })

  useEffect(() => {
    if (isLoading || cbt) return
    toast.error('CBT not found')
    router.push('/admin/cbts')
  }, [cbt, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader size={32} className="text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading CBT details...</p>
      </div>
    )
  }

  if (!cbt) {
    return null
  }

  return <EditCBTForm key={cbt.id} cbt={cbt} cbtId={cbtId} />
}

function EditCBTForm({ cbt, cbtId }: { cbt: adminCbtsApi.CBT; cbtId: string }) {
  const router = useRouter()
  const [formData, setFormData] = useState(() => ({
    title: cbt.title,
    description: cbt.description || '',
    timeLimitMinutes: cbt.time_limit_minutes?.toString() || '',
    passingScore: cbt.passing_score.toString(),
    questionLimit: cbt.question_limit?.toString() || '',
  }))

  const updateMutation = useMutation({
    mutationFn: () =>
      adminCbtsApi.updateAdminCBT(cbtId, {
        title: formData.title,
        description: formData.description || null,
        time_limit_minutes: formData.timeLimitMinutes ? parseInt(formData.timeLimitMinutes) : null,
        passing_score: parseInt(formData.passingScore),
        question_limit: formData.questionLimit ? parseInt(formData.questionLimit) : null,
      }),
    onSuccess: () => {
      toast.success('CBT updated successfully')
      router.push('/admin/cbts')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update CBT')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate()
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
                    onChange={e => setFormData({ ...formData, timeLimitMinutes: e.target.value })}
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
                    onChange={e => setFormData({ ...formData, passingScore: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="questionLimit">Question Limit (per attempt)</Label>
                <Input
                  id="questionLimit"
                  type="number"
                  min="1"
                  value={formData.questionLimit}
                  onChange={e => setFormData({ ...formData, questionLimit: e.target.value })}
                  placeholder="Show all questions"
                />
                <p className="text-xs text-muted-foreground">
                  Number of random questions to show the user from the total question pool.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={updateMutation.isPending || !formData.title}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
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
