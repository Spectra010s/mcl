'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {  Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

type LevelType = {
  id: number
  level_number: number
}

type DepartmentType = {
  id: number
  full_name: string
  short_name: string
  description: string
  academic_levels: LevelType[]
}

type FacultyType = {
  id: number
  full_name: string
  short_name: string
  description: string
  departments: DepartmentType[]
}

export default function AdminContentPage() {
  const [faculties, setFaculties] = useState<FacultyType[]>([])

  const [loading, setLoading] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyType | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'faculty' | 'department' | 'level'>('faculty')
  const [formData, setFormData] = useState({ fullName: '', shortName: '', description: '' })

  const refetchFaculties = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/content/dbmcl`, { cache: 'no-store' })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch Faculties')
      }

      setFaculties(await response.json())
    } catch (error) {
      console.error(error)
      toast.error('Error', { description: 'Failed to fetch and refresh list.'})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refetchFaculties()
  }, [])

  const handleAddFaculty = async () => {
    if (!formData.fullName || !formData.shortName) return

    try {
      const response = await fetch('/api/content/dbmcl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'faculty',
          data: formData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add faculty')
      }

      toast.success('Success', {
        description: `${formData.fullName} added successfully.`,
      })
      setDialogOpen(false)
      setFormData({ fullName: '', shortName: '', description: '' })

      await refetchFaculties()
    } catch (error: unknown) {
      const errorMsg: string = 
    error instanceof Error 
        ? error.message 
        : "Adding Faculty Failed"; 
toast.error('Error', { description: errorMsg });
    }
  }

  const handleAddDepartment = async () => {
    if (!formData.fullName || !formData.shortName || !selectedFaculty) return

    try {
      const response = await fetch('/api/content/dbmcl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'department',
          data: formData,
          faculty_id: selectedFaculty.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add department')
      }

      toast.success('Success', {
        description: `${formData.fullName} added successfully.`,
      })
      setDialogOpen(false)
      setFormData({ fullName: '', shortName: '', description: '' })

      await refetchFaculties()
    } catch (error: unknown) {
      const errorMsg: string = 
    error instanceof Error 
        ? error.message 
        : "Adding Departments Failed"; 
toast.error('Error', { description: errorMsg });
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/admin">
            <span className="flex text-sm mb-4 text-primary ">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Content Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage faculties, departments, and levels
            </p>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Add Faculty Button */}
        <div className="mb-6">
          <Dialog open={dialogOpen && dialogType === 'faculty'} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setDialogType('faculty')
                  setDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4" />
                Add Faculty
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Faculty</DialogTitle>
                <DialogDescription>Create a new faculty with departments</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold mb-2 block">
                    Faculty Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Faculty of Engineering"
                  />
                </div>
                <div>
                  <Label htmlFor="f-shortname" className="text-sm font-semibold mb-2 block">
                    Faculty Short Name
                  </Label>
                  <Input
                    id="f-shortname"
                    value={formData.shortName}
                    onChange={e => setFormData({ ...formData, shortName: e.target.value })}
                    placeholder="ENG.F"
                  />
                </div>
                <div>
                  <Label htmlFor="f-description" className="text-sm font-semibold mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    id="f-description"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the faculty..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false)
                    setFormData({ fullName: '', shortName: '', description: '' })
                  }}
                >
                  Cancel
                </Button>

                <Button onClick={handleAddFaculty}>Add Faculty</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Faculties List */}
        <div className="space-y-6">
          {faculties.map(f => (
            <Card key={f.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-4">
                  <span>{f.full_name}</span>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedFaculty(f)
                      setDialogType('department')
                      setDialogOpen(true)
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Department
                  </Button>
                </CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {f.departments?.map((dept: DepartmentType) => (
                    <div
                      key={dept.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{dept.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {dept.academic_levels?.length || 0} levels
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!f.departments || f.departments.length === 0) && (
                    <p className="text-sm text-muted-foreground">No departments yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Department Dialog */}
        <Dialog open={dialogOpen && dialogType === 'department'} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Department to {selectedFaculty?.full_name}</DialogTitle>
              <DialogDescription>Create a new department</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dept-fullname" className="text-sm font-semibold mb-2 block">
                  Department Full Name
                </Label>
                <Input
                  id="dept-fullname"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Mechatronics Engineering"
                />
              </div>
              <div>
                <Label htmlFor="dept-shortname" className="text-sm font-semibold mb-2 block">
                  Department Short Name
                </Label>
                <Input
                  id="dept-shortname"
                  value={formData.shortName}
                  onChange={e => setFormData({ ...formData, shortName: e.target.value })}
                  placeholder="MTE"
                />
              </div>
              <div>
                <Label htmlFor="dept-description" className="text-sm font-semibold mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="dept-description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  setFormData({ fullName: '', shortName: '', description: '' })
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddDepartment}>Add Department</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
