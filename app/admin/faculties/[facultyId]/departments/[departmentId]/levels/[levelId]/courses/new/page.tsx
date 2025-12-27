'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function NewCoursePage() {
  const params = useParams()
  const router = useRouter()
  const facultyId = params.facultyId as string
  const departmentId = params.departmentId as string
  const levelId = params.levelId as string

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    course_code: '',
    course_title: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/levels/${levelId}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Success', {
          description: 'Course created successfully',
        })
        router.push(
          `/admin/faculties/${facultyId}/departments/${departmentId}/levels/${levelId}/courses`,
        )
      } else {
        const error = await response.json()
        toast.error('Error', {
          description: error.error || 'Failed to create course',
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <Link
            href={`/admin/faculties/${facultyId}/departments/${departmentId}/levels/${levelId}/courses`}
          >
            <span className="flex text-sm mb-4 text-primary items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </span>
          </Link>
          <h1 className="text-2xl font-bold">Add New Course</h1>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course_code">Course Code *</Label>
                <Input
                  id="course_code"
                  placeholder="e.g., GST201"
                  value={formData.course_code}
                  onChange={e => setFormData({ ...formData, course_code: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course_title">Course Title *</Label>
                <Input
                  id="course_title"
                  placeholder="e.g., Applied Mathematics"
                  value={formData.course_title}
                  onChange={e => setFormData({ ...formData, course_title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Course description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Course'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
