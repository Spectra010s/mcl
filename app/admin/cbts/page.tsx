'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as adminCbtsApi from '@/lib/api/admin/cbts'
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

// Types are now imported from adminCbtsApi

export default function AdminCBTsPage() {
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cbtToDelete, setCbtToDelete] = useState<adminCbtsApi.CBT | null>(null)
  const [pendingToggleId, setPendingToggleId] = useState<number | null>(null)

  const { data: cbts = [], isLoading } = useQuery<adminCbtsApi.CBT[]>({
    queryKey: ['admin', 'cbts'],
    queryFn: adminCbtsApi.fetchAdminCBTs,
  })

  const deleteMutation = useMutation({
    mutationFn: adminCbtsApi.deleteAdminCBT,
    onSuccess: () => {
      if (cbtToDelete) {
        toast.success('Success', {
          description: `${cbtToDelete.title} deleted successfully`,
        })
      }
      setDeleteDialogOpen(false)
      setCbtToDelete(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'cbts'] })
    },
    onError: (error: Error) => {
      toast.error('Error', { description: error.message || 'Failed to delete CBT' })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      adminCbtsApi.updateAdminCBT(id, { is_active: !isActive }),
    onSuccess: (_data, variables) => {
      toast.success('Success', {
        description: `CBT ${variables.isActive ? 'deactivated' : 'activated'} successfully`,
      })
      setPendingToggleId(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'cbts'] })
    },
    onError: (error: Error) => {
      setPendingToggleId(null)
      toast.error('Error', { description: error.message || 'Failed to update CBT' })
    },
  })

  const handleDelete = async () => {
    if (!cbtToDelete) return
    deleteMutation.mutate(cbtToDelete.id)
  }

  const handleToggleActive = async (cbt: adminCbtsApi.CBT) => {
    setPendingToggleId(cbt.id)
    toggleMutation.mutate({ id: cbt.id, isActive: cbt.is_active })
  }

  if (isLoading) {
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
                    {pendingToggleId === cbt.id
                      ? 'Updating...'
                      : cbt.is_active
                        ? 'Deactivate'
                        : 'Activate'}
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
            <AlertDialogAction onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
