'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

interface Course {
  id: number
  course_code: string
  course_title: string
  description: string
}

interface Level {
  id: number
  level_number: number
  department: {
    full_name: string
  }
}

export default function LevelCoursesPage() {
  const params = useParams()
  const facultyId = params.facultyId as string
  const departmentId = params.departmentId as string
  const levelId = params.levelId as string

  const [level, setLevel] = useState<Level | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/levels/${levelId}/courses`, {
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('Failed to fetch data')
      const data = await response.json()
      setLevel(data.level)
      setCourses(data.courses)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }, [levelId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async () => {
    if (!courseToDelete) return

    try {
      const response = await fetch(`/api/admin/courses/${courseToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Success', {
          description: 'Course deleted successfully',
        })
      } else {
        const error = await response.json()
        toast.error('Error', {
          description: error.error || 'Failed to delete course',
        })
      }
      setDeleteDialogOpen(false)
      setCourseToDelete(null)
      await fetchData()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading Courses...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <Link href={`/admin/faculties/${facultyId}/departments/${departmentId}/levels`}>
            <span className="flex text-sm mb-4 text-primary items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Levels
            </span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {level?.department.full_name} - {level?.level_number} Level
              </h1>
              <p className="text-sm text-muted-foreground">Manage courses</p>
            </div>
            <Button asChild>
              <Link
                href={`/admin/faculties/${facultyId}/departments/${departmentId}/levels/${levelId}/courses/new`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="flex-1">{course.course_code}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => {
                      setCourseToDelete(course)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>{course.course_title}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No courses found</p>
            <Button asChild>
              <Link
                href={`/admin/faculties/${facultyId}/departments/${departmentId}/levels/${levelId}/courses/new`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add The First Course
              </Link>
            </Button>
          </div>
        )}
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {courseToDelete?.course_code} -{' '}
              {courseToDelete?.course_title}? This will also delete all resources under this course.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCourseToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
