'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, ArrowLeft, Trash2, Edit, Upload } from 'lucide-react'
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
  order_index: number
  explanation: string | null
  question_options: QuestionOption[]
}

interface CBT {
  id: number
  title: string
  courses: {
    course_code: string
    course_title: string
  }
}

export default function QuestionsPage() {
  const params = useParams()
  const cbtId = params.cbtId as string

  const [cbt, setCbt] = useState<CBT | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null)
  const [importing, setImporting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [cbtRes, questionsRes] = await Promise.all([
        fetch(`/api/admin/cbts/${cbtId}`, {
          cache: 'no-store',
        }),
        fetch(`/api/admin/cbts/${cbtId}/questions`, {
          cache: 'no-store',
        }),
      ])

      if (cbtRes.ok) {
        const cbtData = await cbtRes.json()
        setCbt(cbtData)
      }

      if (questionsRes.ok) {
        const questionsData = await questionsRes.json()
        setQuestions(questionsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [cbtId])

  const handleDelete = async () => {
    if (!questionToDelete) return

    try {
      const response = await fetch(`/api/admin/cbts/${cbtId}/questions/${questionToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Question deleted successfully')
        await fetchData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete question')
      }

      setDeleteDialogOpen(false)
      setQuestionToDelete(null)
    } catch (error) {
      console.error('Error deleting question:', error)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.sqf')) {
      toast.error('Please upload a valid .sqf file')
      e.target.value = ''
      return
    }

    setImporting(true)
    const reader = new FileReader()

    reader.onload = async event => {
      const content = event.target?.result as string
      try {
        const response = await fetch(`/api/admin/cbts/${cbtId}/questions/import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
          }),
        })

        const result = await response.json()

        if (response.ok) {
          toast.success(`Successfully imported ${result.count} questions`)
          await fetchData()
        } else {
          if (result.details) {
            console.error('Import validation errors:', result.details)
            toast.error(
              `${result.error}: ${result.details[0]} (and ${result.details.length - 1} more)`,
            )
          } else {
            toast.error(result.error || 'Import failed')
          }
        }
      } catch (error) {
        console.error('Import error:', error)
        toast.error('Failed to connect to the server')
      } finally {
        setImporting(false)
        e.target.value = ''
      }
    }

    reader.onerror = () => {
      toast.error('Failed to read file')
      setImporting(false)
    }

    reader.readAsText(file)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading questions...</div>
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
                  disabled={importing}
                />
                <Button
                  variant="outline"
                  asChild={false}
                  disabled={importing}
                  onClick={() => document.getElementById('sqf-upload')?.click()}
                >
                  <div className="flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    {importing ? 'Importing...' : 'Bulk Import (.sqf)'}
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
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
