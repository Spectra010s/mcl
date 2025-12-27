'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ArrowLeft, Trash2 } from 'lucide-react'
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

interface Faculty {
  id: number
  full_name: string
  short_name: string
  description: string
  _count?: {
    departments: number
  }
}

export default function AdminFacultiesPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null)

  const fetchFaculties = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/faculties', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch faculties')
      const data = await response.json()
      setFaculties(data)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load faculties')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFaculties()
  }, [])

  const handleDelete = async () => {
    if (!facultyToDelete) return

    try {
      const response = await fetch(`/api/admin/faculties/${facultyToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Success', {
          description: `${facultyToDelete.full_name} deleted successfully`,
        })
      } else {
        const error = await response.json()
        toast.error('Error', {
          description: error.error || 'Failed to delete faculty',
        })
      }

      setDeleteDialogOpen(false)
      setFacultyToDelete(null)
      await fetchFaculties()
    } catch (error) {
      console.error('Error deleting department:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading Faculties...</div>
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
              <h1 className="text-2xl font-bold">Faculties</h1>
              <p className="text-sm text-muted-foreground">
                Manage faculties and their departments
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/faculties/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Faculty
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {faculties.map(faculty => (
            <Card key={faculty.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="flex-1">{faculty.full_name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setFacultyToDelete(faculty)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>{faculty.short_name}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 justify-between">
                  {faculty.description}
                </p>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href={`/admin/faculties/${faculty.id}/departments`}>
                    View Departments ({faculty._count?.departments || 0})
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {faculties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No faculties found</p>
            <Button asChild>
              <Link href="/admin/faculties/new">
                <Plus className="w-4 h-4 mr-2" />
                Add The First Faculty
              </Link>
            </Button>
          </div>
        )}
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Faculty</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {facultyToDelete?.full_name}? This will also delete
              all departments, levels, and courses under this faculty. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFacultyToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
