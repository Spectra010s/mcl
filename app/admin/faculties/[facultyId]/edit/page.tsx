'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'

interface Faculty {
  id: number
  full_name: string
  short_name: string
  description: string
}

export default function EditFacultyPage() {
  const router = useRouter()
  const params = useParams()
  const facultyId = params.facultyId as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    shortName: '',
    description: '',
  })

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const response = await fetch(`/api/admin/faculties/${facultyId}`, { cache: 'no-store' })
        if (!response.ok) throw new Error('Failed to fetch faculty')

        const data: Faculty = await response.json()
        setFormData({
          fullName: data.full_name,
          shortName: data.short_name,
          description: data.description,
        })
      } catch (error) {
        console.error(error)
        toast.error('Failed to load faculty')
        router.push('/admin/faculties')
      } finally {
        setLoading(false)
      }
    }

    fetchFaculty()
  }, [facultyId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setSubmitting(true)

    if (!formData.fullName || !formData.shortName) {
      toast.error('Please fill in all required fields')
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch(`/api/admin/faculties/${facultyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Success', {
          description: 'Faculty updated successfully',
        })

        router.push('/admin/faculties')
      } else {
        const error = await response.json()
        toast.error('Error', {
          description: error.error || 'Failed to update faculty',
        })
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred while updating the faculty')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <Link href="/admin/faculties">
            <span className="flex text-sm mb-4 text-primary items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Faculties
            </span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Faculty</h1>
            <p className="text-sm text-muted-foreground">Update faculty information</p>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Faculty Information</CardTitle>
            <CardDescription>Edit the details for this faculty</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g., Faculty of Engineering"
                  required
                />
              </div>

              <div>
                <Label htmlFor="shortName">
                  Short Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="shortName"
                  value={formData.shortName}
                  onChange={e => setFormData({ ...formData, shortName: e.target.value })}
                  placeholder="e.g., ENG.F"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the faculty..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
