'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, BookmarkPlus, ChevronLeft } from 'lucide-react'
import { useParams } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import LinkifiedText from "@/components/LinkifiedText"

interface Resource {
  id: number
  title: string
  description: string
  file_type: string
  file_size_bytes: number
  view_count: number
  uploaded_by: string | null

  user_bookmarks: Array<{
    user_id: number
  }>

  course_id: {
    id: number
    course_code: string
    course_title: string
    academic_level_id: {
      level_number: number
      department_id: {
        full_name: string
      }
    }
  } | null

  resource_keywords: Array<{
    keyword: string
  }>

  uploader: {
    username: string | null
  }
}

export default function ResourcePage() {
  const params = useParams()
  const resourceId = params.resourceId as string
  const [resource, setResource] = useState<Resource | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        const { data: resourceData, error: resourceError } = await supabase
          .from('resources')
          .select(
            `
          *,
          user_bookmarks(
            user_id
          ),
          course_id(
            id,
            course_code,
            course_title,
            academic_level_id(
              level_number,
              department_id(
                full_name
              )
            )
          ),
          resource_keywords(keyword),
          uploader:uploaded_by(
          username
          )
        `,
          )
          .eq('id', resourceId)
          .eq('is_approved', true)
          .single()

        if (resourceError) throw resourceError
        setResource(resourceData)

        const isResourceBookmarked =
          !!user &&
          resourceData.user_bookmarks.length > 0 &&
          resourceData.user_bookmarks.some(
            (bookmark: { user_id: string }) => bookmark.user_id === user.id,
          )

        setIsBookmarked(isResourceBookmarked)

        await supabase.from('view_history').insert({
          resource_id: resourceId,
          user_id: user?.id || null,
        })
      } catch (error) {
        console.error('Error fetching resource:', JSON.stringify(error, null, 2))

        console.error('Error fetching resource:', error instanceof Error ? error.message : error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resourceId, supabase])

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <p>Loading...</p>
      </main>
    )
  }

  if (!resource) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <p>Resource not found</p>
      </main>
    )
  }

  const handleDownload = () => {
    setActionLoading('download')

    const form = document.createElement('form')
    form.method = 'POST'
    form.action = `/api/resources/${resourceId}/download`
    form.style.display = 'none'
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)

    setTimeout(() => setActionLoading(null), 2000)
  }

  const handleBookmark = async () => {
    setActionLoading('bookmark')
    try {
      const response = await fetch(`/api/resources/${resourceId}/bookmark`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Bookmark failed')

      const data = await response.json()
      setIsBookmarked(data.bookmarked)
    } catch (error) {
      console.error('Bookmark error:', error)
      alert('Failed to bookmark')
    } finally {
      setActionLoading(null)
    }
  }

  const course = resource.course_id
  const level = course?.academic_level_id
  const dept = level?.department_id
  const uploaderUsername = resource.uploader.username || 'Anonymous'

  return (
    <>
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 md:px-6">
        <Link
          href="/browse/faculties"
          className="flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Browse
        </Link>

        {/* Resource Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">{resource.title}</h1>

          {/* Course Info */}
          {course && (
            <div className="text-muted-foreground mb-4">
              <p>
                {course.course_code}: {course.course_title}
              </p>
              <p>
                {level?.level_number} Level • {dept?.full_name}
              </p>
            </div>
          )}

          {/* Metadata Row */}
          <div className="flex flex-wrap gap-6 py-4 border-b border-border">
            <div>
              <p className="text-sm text-muted-foreground">File Type</p>
              <p className="font-semibold">{resource.file_type?.toUpperCase() || 'FILE'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">File Size</p>
              <p className="font-semibold">
                {(resource.file_size_bytes / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Views</p>
              <p className="font-semibold">{resource.view_count || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Uploaded by</p>
              <p className="font-semibold">{uploaderUsername}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {resource.description && (
          <Card className="p-4 mb-8">
            <h2 className="font-semibold text-lg">Description</h2>
            <LinkifiedText
            className="leading-relaxed text-foreground whitespace-pre-wrap"
             text={resource.description}
            />
          </Card>
        )}

        {/* Keywords */}
        {resource.resource_keywords?.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="font-semibold text-lg mb-3">Keywords</h2>
            <div className="flex flex-wrap gap-2">
              {resource.resource_keywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {kw.keyword}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        {user ? (
          <div className="flex gap-3 mb-8">
            <Button
              onClick={handleDownload}
              disabled={actionLoading === 'download'}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {actionLoading === 'download' ? 'Downloading...' : 'Download'}
            </Button>
            <Button
              variant="outline"
              className={`flex items-center gap-2 ${isBookmarked ? 'bg-blue-50 text-blue-600' : 'bg-transparent'}`}
              onClick={handleBookmark}
              disabled={actionLoading === 'bookmark'}
            >
              <BookmarkPlus className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </Button>
          </div>
        ) : (
          <Link href="/login" className="block mb-8">
            <Button size="lg" className="w-full">
              Login to Download
            </Button>
          </Link>
        )}
      </main>
    </>
  )
}
