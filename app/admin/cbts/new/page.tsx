'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import * as adminCbtsApi from '@/lib/api/admin/cbts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// Types are now handled by adminCbtsApi or common admin types
interface Faculty {
  id: number
  full_name: string
}

interface Department {
  id: number
  full_name: string
}

interface Level {
  id: number
  level_number: number
}

interface Course {
  id: number
  course_code: string
  course_title: string
}

export default function NewCBTPage() {
  const router = useRouter()

  const [selectedFaculty, setSelectedFaculty] = useState<string>('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')

  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    timeLimitMinutes: '',
    passingScore: '70',
    questionLimit: '',
  })

  const { data: faculties = [], isLoading: isLoadingFaculties } = useQuery<Faculty[]>({
    queryKey: ['admin', 'faculties'],
    queryFn: async () => {
      const response = await fetch('/api/admin/faculties', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to load faculties')
      return response.json()
    },
  })

  const { data: departments = [], isFetching: isFetchingDepartments } = useQuery<Department[]>({
    queryKey: ['admin', 'faculties', selectedFaculty, 'departments'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/faculties/${selectedFaculty}/departments`)
      if (!response.ok) throw new Error('Failed to load departments')
      const data = await response.json()
      return data.departments || []
    },
    enabled: !!selectedFaculty,
  })

  const { data: levels = [], isFetching: isFetchingLevels } = useQuery<Level[]>({
    queryKey: ['admin', 'departments', selectedDepartment, 'levels'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/departments/${selectedDepartment}/levels`)
      if (!response.ok) throw new Error('Failed to load levels')
      const data = await response.json()
      return data.levels || []
    },
    enabled: !!selectedDepartment,
  })

  const { data: courses = [], isFetching: isFetchingCourses } = useQuery<Course[]>({
    queryKey: ['admin', 'levels', selectedLevel, 'courses'],
    queryFn: async () => {
      const response = await fetch(`/api/admin/levels/${selectedLevel}/courses`)
      if (!response.ok) throw new Error('Failed to load courses')
      const { courses } = await response.json()
      return courses || []
    },
    enabled: !!selectedLevel,
  })

  const handleFacultyChange = async (facultyId: string) => {
    setSelectedFaculty(facultyId)
    setSelectedDepartment('')
    setSelectedLevel('')
    setFormData(prev => ({ ...prev, courseId: '' }))
  }

  const handleDeptChange = async (deptId: string) => {
    setSelectedDepartment(deptId)
    setSelectedLevel('')
    setFormData(prev => ({ ...prev, courseId: '' }))
  }

  const handleLevelChange = async (levelId: string) => {
    setSelectedLevel(levelId)
    setFormData(prev => ({ ...prev, courseId: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate()
  }

  const createMutation = useMutation({
    mutationFn: () =>
      adminCbtsApi.createAdminCBT({
        courseId: parseInt(formData.courseId),
        title: formData.title,
        description: formData.description || null,
        timeLimitMinutes: formData.timeLimitMinutes ? parseInt(formData.timeLimitMinutes) : null,
        passingScore: parseInt(formData.passingScore),
        questionLimit: formData.questionLimit ? parseInt(formData.questionLimit) : null,
      }),
    onSuccess: (cbt: { id: number }) => {
      toast.success('CBT created successfully')
      router.push(`/admin/cbts/${cbt.id}/questions`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create CBT')
    },
  })

  if (isLoadingFaculties) {
    return <div className="flex items-center justify-center min-h-screen">Loading Page...</div>
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
            <h1 className="text-2xl font-bold">Create New CBT</h1>
            <p className="text-sm text-muted-foreground">
              Add a new computer-based test for a course
            </p>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>CBT Details</CardTitle>
            <CardDescription>
              Fill in the details for the new CBT. You can add questions after creating.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Faculty *</Label>
                  <Select value={selectedFaculty} onValueChange={handleFacultyChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculties.map(f => (
                        <SelectItem key={f.id} value={String(f.id)}>
                          <span className="truncate block max-w-[200px] md:max-w-xs">
                            {f.full_name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={selectedDepartment}
                    onValueChange={handleDeptChange}
                    disabled={!selectedFaculty}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={selectedFaculty ? 'Select Department' : 'Select faculty first'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {isFetchingDepartments && !selectedDepartment && (
                        <div className="flex items-center justify-center py-2">
                          <div className="animate-spin border-2 border-primary/20 border-t-primary rounded-full w-4 h-4" />
                        </div>
                      )}
                      {departments.map(d => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          <span className="truncate block max-w-[200px] md:max-w-xs">
                            {d.full_name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Academic Level *</Label>
                  <Select
                    value={selectedLevel}
                    onValueChange={handleLevelChange}
                    disabled={!selectedDepartment}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          selectedDepartment ? 'Select Level' : 'Select department first'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {isFetchingLevels && !selectedLevel && selectedDepartment && (
                        <div className="flex items-center justify-center py-2">
                          <div className="animate-spin border-2 border-primary/20 border-t-primary rounded-full w-4 h-4" />
                        </div>
                      )}
                      {levels.map(l => (
                        <SelectItem key={l.id} value={String(l.id)}>
                          {l.level_number} Level
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Course *</Label>
                  <Select
                    value={formData.courseId}
                    onValueChange={value => setFormData({ ...formData, courseId: value })}
                    disabled={!selectedLevel}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={selectedLevel ? 'Select Course' : 'Select level first'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {isFetchingCourses && !formData.courseId && selectedLevel && (
                        <div className="flex items-center justify-center py-2">
                          <div className="animate-spin border-2 border-primary/20 border-t-primary rounded-full w-4 h-4" />
                        </div>
                      )}
                      {courses.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          <span className="truncate block max-w-[200px] md:max-w-xs">
                            {c.course_code}: {c.course_title}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

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
                <Button
                  type="submit"
                  disabled={createMutation.isPending || !formData.courseId || !formData.title}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create CBT'}
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
