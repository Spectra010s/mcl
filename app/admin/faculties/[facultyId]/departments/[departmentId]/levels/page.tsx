'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
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

interface Level {
  id: number
  level_number: number
  _count?: {
    courses: number
  }
}

interface Department {
  id: number
  full_name: string
  short_name: string
}

export default function DepartmentLevelsPage() {
  const params = useParams()
  const facultyId = params.facultyId as string
  const departmentId = params.departmentId as string

  const [department, setDepartment] = useState<Department | null>(null)
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [levelToDelete, setLevelToDelete] = useState<Level | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/departments/${departmentId}/levels`, {
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('Failed to fetch data')
      const data = await response.json()
      setDepartment(data.department)
      setLevels(data.levels)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load levels')
    } finally {
      setLoading(false)
    }
  }, [departmentId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async () => {
    if (!levelToDelete) return

    try {
      const response = await fetch(`/api/admin/levels/${levelToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Level deleted successfully')
      } else {
        const error = await response.json()
        toast.error('Error', {
          description: error.error || 'Failed to delete level',
        })
      }
      setDeleteDialogOpen(false)
      setLevelToDelete(null)
      await fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading Levels...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <Link href={`/admin/faculties/${facultyId}/departments`}>
            <span className="flex text-sm mb-4 text-primary items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Departments
            </span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{department?.full_name}</h1>
              <p className="text-sm text-muted-foreground">Manage academic levels</p>
            </div>
            <Button asChild>
              <Link href={`/admin/faculties/${facultyId}/departments/${departmentId}/levels/new`}>
                <Plus className="w-4 h-4 mr-2" />
                Add Level
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {levels.map(level => (
            <Card key={level.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="flex-1">{level.level_number} Level</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => {
                      setLevelToDelete(level)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link
                    href={`/admin/faculties/${facultyId}/departments/${departmentId}/levels/${level.id}/courses`}
                  >
                    View Courses ({level._count?.courses || 0})
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {levels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No levels found</p>
            <Button asChild>
              <Link href={`/admin/faculties/${facultyId}/departments/${departmentId}/levels/new`}>
                <Plus className="w-4 h-4 mr-2" />
                Add The First Level
              </Link>
            </Button>
          </div>
        )}
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Level</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {levelToDelete?.level_number}? Level. This will also
              delete all courses under this level. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLevelToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
