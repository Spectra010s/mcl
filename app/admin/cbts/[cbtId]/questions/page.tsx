'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as adminCbtsApi from '@/lib/api/admin/cbts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, ArrowLeft, Trash2, Edit, Upload } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader } from '@/components/ui/loader'
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

// Types are now handled by adminCbtsApi

export default function QuestionsPage() {
  const params = useParams()
  const cbtId = params.cbtId as string

  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<adminCbtsApi.Question | null>(null)

  const { data: cbt, isLoading: isLoadingCbt } = useQuery<adminCbtsApi.CBT>({
    queryKey: ['admin', 'cbts', cbtId],
    queryFn: () => adminCbtsApi.fetchAdminCBT(cbtId),
  })

  const { data: questions = [], isLoading: isLoadingQuestions } = useQuery<adminCbtsApi.Question[]>(
    {
      queryKey: ['admin', 'cbts', cbtId, 'questions'],
      queryFn: () => adminCbtsApi.fetchAdminQuestions(cbtId),
    },
  )

  const deleteMutation = useMutation({
    mutationFn: (questionId: number) => adminCbtsApi.deleteAdminQuestion(cbtId, questionId),
    onSuccess: () => {
      toast.success('Question deleted successfully')
      setDeleteDialogOpen(false)
      setQuestionToDelete(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'cbts', cbtId, 'questions'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete question')
    },
  })

  const importMutation = useMutation({
    mutationFn: (content: string) => adminCbtsApi.importAdminQuestions(cbtId, content),
    onSuccess: (result: { count: number }) => {
      toast.success(`Successfully imported ${result.count} questions`)
      queryClient.invalidateQueries({ queryKey: ['admin', 'cbts', cbtId, 'questions'] })
    },
    onError: (error: Error & { details?: string[] }) => {
      if (error.details && error.details.length > 0) {
        toast.error(`${error.message}: ${error.details[0]} (and ${error.details.length - 1} more)`)
      } else {
        toast.error(error.message || 'Import failed')
      }
    },
  })

  const handleDelete = async () => {
    if (!questionToDelete) return
    deleteMutation.mutate(questionToDelete.id)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.sqf')) {
      toast.error('Please upload a valid .sqf file')
      e.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onload = async event => {
      const content = event.target?.result as string
      try {
        importMutation.mutate(content)
      } catch (error) {
        console.error('Import error:', error)
      } finally {
        e.target.value = ''
      }
    }

    reader.onerror = () => {
      toast.error('Failed to read file')
    }

    reader.readAsText(file)
  }

  if (isLoadingCbt || isLoadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader size={32} className="text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading questions...</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{cbt?.title || 'Questions'}</h1>
              <p className="text-sm text-muted-foreground">
                {cbt?.courses?.course_code}: {cbt?.courses?.course_title}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type="file"
                  accept=".sqf"
                  onChange={handleImport}
                  className="hidden"
                  id="sqf-upload"
                  disabled={importMutation.isPending}
                />
                <Button
                  variant="outline"
                  asChild={false}
                  disabled={importMutation.isPending}
                  onClick={() => document.getElementById('sqf-upload')?.click()}
                >
                  <div className="flex items-center">
                    {importMutation.isPending ? (
                      <Loader size={16} className="text-white mr-2" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {importMutation.isPending ? 'Importing...' : 'Bulk Import (.sqf)'}
                  </div>
                </Button>
              </div>
              <Button asChild>
                <Link href={`/admin/cbts/${cbtId}/questions/new`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="text-muted-foreground">Q{index + 1}.</span>
                      <span className="line-clamp-1">{question.question_text}</span>
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <Badge variant="outline">{question.question_type.toUpperCase()}</Badge>
                      <Badge variant="secondary">
                        {question.points} pt
                        {question.points !== 1 ? 's' : ''}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link href={`/admin/cbts/${cbtId}/questions/${question.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setQuestionToDelete(question)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {question.question_options.map((option, optIndex) => (
                    <div
                      key={option.id}
                      className={`text-sm p-2 rounded border ${
                        option.is_correct
                          ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'
                          : 'border-border'
                      }`}
                    >
                      <span className="font-medium mr-2">
                        {String.fromCharCode(65 + optIndex)}.
                      </span>
                      {option.option_text}
                    </div>
                  ))}
                </div>
                {question.explanation && (
                  <p className="text-sm text-muted-foreground mt-3 italic">
                    Explanation: {question.explanation}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {questions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No questions yet</p>
            <Button asChild>
              <Link href={`/admin/cbts/${cbtId}/questions/new`}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Question
              </Link>
            </Button>
          </div>
        )}
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setQuestionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
