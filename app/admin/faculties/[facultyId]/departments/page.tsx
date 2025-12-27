'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus, Trash2, ArrowLeft, Building2 } from 'lucide-react'
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
import { toast } from 'sonner'

interface Department {
  id: number
  full_name: string
  short_name: string
  description: string
  _count?: {
    academic_levels: number
  }
}

interface Faculty {
  id: number
  full_name: string
  short_name: string
}

export default function DepartmentsPage() {
  const params = useParams()
  const facultyId = params.facultyId as string

  const [faculty, setFaculty] = useState<Faculty | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null)

  const fetchFacultyAndDepartments = useCallback(async () => {
    if (!facultyId) return
    try {
      const response = await fetch(`/api/admin/faculties/${facultyId}/departments`)

      if (response.ok) {
        const data = await response.json()
        setFaculty(data.faculty)
        setDepartments(data.departments)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error', {
        description: 'Failed to load departments',
      })
    } finally {
      setLoading(false)
    }
  }, [facultyId])

  useEffect(() => {
    fetchFacultyAndDepartments()
  }, [fetchFacultyAndDepartments])

  const handleDelete = async () => {
    if (!deptToDelete) return

    try {
      const response = await fetch(`/api/admin/departments/${deptToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Success', {
          description: 'Department deleted successfully',
        })
      } else {
        const error = await response.json()
        toast.error('Error', {
          description: error.error || 'Failed to delete department',
        })
      }

      setDeleteDialogOpen(false)
      setDeptToDelete(null)
      await fetchFacultyAndDepartments()
    } catch (error) {
      console.error('Error deleting department:', error)
      toast.error('Failed to delete department')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">Loading Departments...</div>
    )
  }

  return (
    <div className="min-h-sreen ">
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <Link href="/admin/faculties">
            <span className="flex text-sm mb-4 text-primary items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Faculties
            </span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Departments</h1>
              <p className="text-sm text-muted-foreground">
                {faculty?.full_name} ({faculty?.short_name})
              </p>
            </div>
            <Button asChild>
              <Link href={`/admin/faculties/${facultyId}/departments/new`}>
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map(dept => (
            <Card key={dept.id} className=" hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="text-xl">{dept.full_name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setDeptToDelete(dept)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>

                <CardDescription className="font-medium">{dept.short_name}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {dept.description}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="cursor-pointer w-full bg-transparent">
                  <Link href={`/admin/faculties/${facultyId}/departments/${dept.id}/levels`}>
                    View Levels ({dept._count?.academic_levels || 0})
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        {departments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No Departments found</p>
            <Button asChild>
              <Link href={`/admin/faculties/${facultyId}/departments/new`}>
                <Building2 className="w-4 h-4 mr-2" />
                Add The First Department
              </Link>
            </Button>
            <p className="mt-4 text-sm">
              <span className="text-muted-foreground">pro tip! </span>Departments name with General
              Course is special
            </p>
          </div>
        )}
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this {deptToDelete?.full_name} and all its levels and
              courses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeptToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
