'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [courses, setCourses] = useState<Course[]>([])

  const [isLoadingPage, setIsLoadingPage] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [selectedFaculty, setSelectedFaculty] = useState<string>('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')

  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    timeLimitMinutes: '',
    passingScore: '70',
  })

  useEffect(() => {
    const fetchFaculties = async () => {
      setIsLoadingPage(true)
      try {
        const response = await fetch('/api/admin/faculties', { cache: 'no-store' })
        if (response.ok) {
          const data = await response.json()
          setFaculties(data)
        }
      } catch (error) {
        console.error('Error fetching faculties:', error)
        toast.error('Failed to load faculties')
      } finally {
        setIsLoadingPage(false)
      }
    }
    fetchFaculties()
  }, [])

  const handleFacultyChange = async (facultyId: string) => {
    setSelectedFaculty(facultyId)
    setSelectedDepartment('')
    setSelectedLevel('')
    setFormData(prev => ({ ...prev, courseId: '' }))
    setDepartments([])
    setLevels([])
    setCourses([])

    if (facultyId) {
      setIsFetching(true)
      try {
        const response = await fetch(`/api/admin/faculties/${facultyId}/departments`)
        if (response.ok) {
          const data = await response.json()
          setDepartments(data.departments || [])
        }
      } catch (error) {
        console.error('Error fetching departments:', error)
      } finally {
        setIsFetching(false)
      }
    }
  }

  const handleDeptChange = async (deptId: string) => {
    setSelectedDepartment(deptId)
    setSelectedLevel('')
    setFormData(prev => ({ ...prev, courseId: '' }))
    setLevels([])
    setCourses([])

    if (deptId) {
      setIsFetching(true)
      try {
        const response = await fetch(`/api/admin/departments/${deptId}/levels`)
        if (response.ok) {
          const data = await response.json()
          setLevels(data.levels || [])
        }
      } catch (error) {
        console.error('Error fetching levels:', error)
      } finally {
        setIsFetching(false)
      }
    }
  }

  const handleLevelChange = async (levelId: string) => {
    setSelectedLevel(levelId)
    setFormData(prev => ({ ...prev, courseId: '' }))
    setCourses([])

    if (levelId) {
      setIsFetching(true)
      try {
        const response = await fetch(`/api/admin/levels/${levelId}/courses`)
        if (response.ok) {
          const { courses } = await response.json()
          setCourses(courses || [])
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
      } finally {
        setIsFetching(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/admin/cbts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: parseInt(formData.courseId),
          title: formData.title,
          description: formData.description || null,
          timeLimitMinutes: formData.timeLimitMinutes ? parseInt(formData.timeLimitMinutes) : null,
          passingScore: parseInt(formData.passingScore),
        }),
      })

      if (response.ok) {
        const cbt = await response.json()
        toast.success('CBT created successfully')
        router.push(`/admin/cbts/${cbt.id}/questions`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create CBT')
      }
    } catch (error) {
      console.error('Error creating CBT:', error)
      toast.error('Failed to create CBT')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoadingPage) {
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
                      {isFetching && !selectedDepartment && (
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
                      {isFetching && !selectedLevel && selectedDepartment && (
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
                      {isFetching && !formData.courseId && selectedLevel && (
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

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={submitting || !formData.courseId || !formData.title}
                >
                  {submitting ? 'Creating...' : 'Create CBT'}
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
