'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, ArrowLeft, Trash2, Edit, FileQuestion } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
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
  is_active: boolean
  created_at: string
  courses: Course
  _count: {
    questions: number
  }
}

export default function AdminCBTsPage() {
  const [cbts, setCbts] = useState<CBT[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cbtToDelete, setCbtToDelete] = useState<CBT | null>(null)

  const fetchCBTs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/cbts', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch CBTs')
      const data = await response.json()
      setCbts(data)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load CBTs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCBTs()
  }, [])

  const handleDelete = async () => {
    if (!cbtToDelete) return

    try {
      const response = await fetch(`/api/admin/cbts/${cbtToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Success', {
          description: `${cbtToDelete.title} deleted successfully`,
        })
      } else {
        const error = await response.json()
        toast.error('Error', {
          description: error.error || 'Failed to delete CBT',
        })
      }

      setDeleteDialogOpen(false)
      setCbtToDelete(null)
      await fetchCBTs()
    } catch (error) {
      console.error('Error deleting CBT:', error)
    }
  }

  const handleToggleActive = async (cbt: CBT) => {
    try {
      const response = await fetch(`/api/admin/cbts/${cbt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !cbt.is_active }),
      })

      if (response.ok) {
        toast.success('Success', {
          description: `CBT ${cbt.is_active ? 'deactivated' : 'activated'} successfully`,
        })
        await fetchCBTs()
      } else {
        const error = await response.json()
        toast.error('Error', { description: error.error || 'Failed to update CBT' })
      }
    } catch (error) {
      console.error('Error updating CBT:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading CBTs...</div>
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <Link href="/admin">
            <span className="flex text-sm mb-4 text-primary items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Computer-Based Tests</h1>
              <p className="text-sm text-muted-foreground">Manage CBTs and their questions</p>
            </div>
            <Button asChild>
              <Link href="/admin/cbts/new">
                <Plus className="w-4 h-4 mr-2" />
                Create CBT
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cbts.map(cbt => (
            <Card key={cbt.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{cbt.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {cbt.courses.course_code}: {cbt.courses.course_title}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link href={`/admin/cbts/${cbt.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setCbtToDelete(cbt)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant={cbt.is_active ? 'default' : 'secondary'}>
                    {cbt.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">
                    {cbt._count.questions} question{cbt._count.questions !== 1 ? 's' : ''}
                  </Badge>
                  {cbt.time_limit_minutes && (
                    <Badge variant="outline">{cbt.time_limit_minutes} min</Badge>
                  )}
                  <Badge variant="outline">Pass: {cbt.passing_score}%</Badge>
                </div>

                {cbt.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {cbt.description}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1 bg-transparent">
                    <Link href={`/admin/cbts/${cbt.id}/questions`}>
                      <FileQuestion className="w-4 h-4 mr-2" />
                      Questions
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleToggleActive(cbt)}>
                    {cbt.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {cbts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No CBTs found</p>
            <Button asChild>
              <Link href="/admin/cbts/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First CBT
              </Link>
            </Button>
          </div>
        )}
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete CBT</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{cbtToDelete?.title}&quot;? This will also
              delete all questions and attempts. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCbtToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
