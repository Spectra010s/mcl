'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, BookmarkPlus, ChevronLeft, Eye } from 'lucide-react'
import { ResourcePreview } from '@/components/ResourcePreview'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import LinkifiedText from '@/components/LinkifiedText'
import * as resourcesApi from '@/lib/api/resources'
import { buildLoginRedirect } from '@/lib/auth/loginRedirect'
import type { User } from '@supabase/supabase-js'

interface Resource {
  id: number
  title: string
  description: string
  file_type: string
  file_size_bytes: number
  view_count: number
  uploaded_by: string | null

  user_bookmarks: Array<{
    user_id: string
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

  uploader?: {
    username: string | null
  } | null
}

interface ResourceClientProps {
  resource: Resource
  user: User | null
  initialBookmark: boolean
  action: string
}

export default function ResourceClient({
  resource,
  user,
  initialBookmark,
  action,
}: ResourceClientProps) {
  const router = useRouter()

  const [isBookmarked, setIsBookmarked] = useState(initialBookmark)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [preview, setPreview] = useState<{
    url: string
    type: string
  } | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false)

  const resourceId = resource.id

  const handleDownload = useCallback(() => {
    if (!user) {
      router.push(
        buildLoginRedirect(
          `/resource/${resourceId}?action=download`,
          'Please log in to download this resource.',
        ),
      )
      return
    }

    setActionLoading('download')

    const form = document.createElement('form')
    form.method = 'POST'
    form.action = resourcesApi.getResourceDownloadUrl(resourceId)
    form.style.display = 'none'
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)

    setTimeout(() => setActionLoading(null), 2000)
  }, [resourceId, router, user])

  const handleBookmark = useCallback(async () => {
    if (!user) {
      router.push(
        buildLoginRedirect(
          `/resource/${resourceId}?action=bookmark`,
          'Please log in to save this resource to your bookmarks.',
        ),
      )
      return
    }

    setActionLoading('bookmark')
    try {
      const data = await resourcesApi.toggleResourceBookmark(resourceId)
      setIsBookmarked(data.bookmarked)
    } catch (error) {
      console.error('Bookmark error:', error)
      toast.error('Failed to bookmark. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }, [resourceId, router, user])

  const handlePreview = useCallback(async () => {
    if (!user) {
      router.push(
        buildLoginRedirect(
          `/resource/${resourceId}?action=preview`,
          'Please log in to preview this resource.',
        ),
      )
      return
    }

    setActionLoading('preview')
    try {
      const data = await resourcesApi.fetchResourcePreview(resourceId)
      setPreview({
        url: data.signedUrl,
        type: data.fileType,
      })
      setIsPreviewOpen(true)
    } catch (error) {
      console.error('Preview error:', error)
      toast.error(
        'Unable to open preview. This resource may not be available for viewing at the moment.',
      )
    } finally {
      setActionLoading(null)
    }
  }, [resourceId, router, user])

  // Handle auto-trigger after login
  useEffect(() => {
    if (action && user && resource && !hasAutoTriggered) {
      setHasAutoTriggered(true)

      router.replace(`/resource/${resourceId}`, {
        scroll: false,
      })

      if (action === 'download') handleDownload()
      else if (action === 'preview') handlePreview()
      else if (action === 'bookmark') handleBookmark()
    }
  }, [
    action,
    user,
    resource,
    hasAutoTriggered,
    resourceId,
    router,
    handleDownload,
    handlePreview,
    handleBookmark,
  ])

  const isPreviewable = (type: string) => {
    const previewableTypes = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']
    return previewableTypes.includes(type.toLowerCase())
  }

  const course = resource.course_id
  const level = course?.academic_level_id
  const dept = level?.department_id
  const uploaderUsername = resource.uploader?.username || 'MCL Team'

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
              {resource.resource_keywords.map((kw: { keyword: string }, idx: number) => (
                <span
                  key={`${kw.keyword}-${idx}`}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {kw.keyword}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <Button
            onClick={handleDownload}
            disabled={actionLoading === 'download'}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {actionLoading === 'download' ? 'Downloading...' : 'Download'}
          </Button>
          {isPreviewable(resource.file_type) && (
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={actionLoading === 'preview'}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {actionLoading === 'preview' ? 'Loading...' : 'Preview'}
            </Button>
          )}
          <Button
            variant="outline"
            className={`flex items-center gap-2 ${isBookmarked ? 'bg-blue-50 text-blue-600' : 'bg-transparent'}`}
            onClick={handleBookmark}
            disabled={actionLoading === 'bookmark'}
          >
            <BookmarkPlus className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            {actionLoading === 'bookmark'
              ? 'Bookmarking...'
              : isBookmarked
                ? 'Bookmarked'
                : 'Bookmark'}
          </Button>
        </div>

        {/* Resource Preview Component */}
        {preview && (
          <ResourcePreview
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            title={resource.title}
            fileUrl={preview.url}
            fileType={preview.type}
          />
        )}
      </main>
    </>
  )
}
