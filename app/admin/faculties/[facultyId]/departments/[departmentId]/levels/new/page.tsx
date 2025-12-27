'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function NewLevelPage() {
  const params = useParams()
  const router = useRouter()
  const facultyId = params.facultyId as string
  const departmentId = params.departmentId as string

  const [loading, setLoading] = useState(false)
  const [levelNumber, setLevelNumber] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!levelNumber) {
      toast.error('Please select a level')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/admin/departments/${departmentId}/levels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level_number: Number.parseInt(levelNumber) }),
      })

      if (response.ok) {
        toast.success('Success', {
          description: 'Level created successfully',
        })

        router.push(`/admin/faculties/${facultyId}/departments/${departmentId}/levels`)
      } else {
        const error = await response.json()
        toast.error('Error', {
          description: error.error || 'Failed to create level',
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
          <Link href={`/admin/faculties/${facultyId}/departments/${departmentId}/levels`}>
            <span className="flex text-sm mb-4 text-primary items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Levels
            </span>
          </Link>
          <h1 className="text-2xl font-bold">Add New Level</h1>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Level Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="level_number">Academic Level *</Label>
                <Select value={levelNumber} onValueChange={setLevelNumber}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100 Level</SelectItem>
                    <SelectItem value="200">200 Level</SelectItem>
                    <SelectItem value="300">300 Level</SelectItem>
                    <SelectItem value="400">400 Level</SelectItem>
                    <SelectItem value="500">500 Level</SelectItem>
                    <SelectItem value="600">600 Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Level'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
