'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function NewDepartmentPage() {
  const params = useParams()
  const router = useRouter()
  const facultyId = params.facultyId as string

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    shortName: '',
    description: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    if (!formData.fullName || !formData.shortName || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch(`/api/admin/faculties/${facultyId}/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Success', {
          description: 'Department created successfully',
        })
        router.push(`/admin/faculties/${facultyId}/departments`)
      } else {
        const error = await response.json()
        toast.error('Error', {
          description: error.error || 'Failed to create department',
        })
      }
    } catch (error) {
      console.error('Error creating department:', error)
      toast.error('Error', {
        description: 'Failed to create department',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <Link href={`/admin/faculties/${facultyId}/departments`}>
            <span className="flex text-sm mb-4 text-primary items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Departments
            </span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Add New Faculty</h1>
            <p className="text-sm text-muted-foreground">Create a new Department</p>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Department Details</CardTitle>
            <CardDescription>Enter the information for the new department</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
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
                  <Label htmlFor="description" className="text-sm font-semibold mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Brief description of the department..."
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/admin/faculties/${facultyId}/departments`)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Department'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
