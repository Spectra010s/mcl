import { createClient } from '@/lib/supabase/server'
import ResourceClient from './client'
import { generateBreadcrumbSchema, createSchema } from '@/lib/schema'
import { baseUrl } from '@/constants'
import type { Metadata } from 'next'
import type { User } from '@supabase/supabase-js'

interface PageProps {
  params: Promise<{
    resourceId: string
  }>
}
async function getResourceData(resourceId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  if (resourceError) {
    console.error('Error fetching resource:', resourceError)
    throw resourceError
  }

  await supabase.from('view_history').insert({
    resource_id: resourceId,
    user_id: user?.id || null,
  })

  return {
    resource: resourceData,
    user,
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { resourceId } = await params
  const { resource } = await getResourceData(resourceId)
  if (!resource)
    return {
      title: 'Resource Not Found',
    }

  return {
    title: `Resource Details: ${resource.title}`,
    description: `Download, view, or bookmark ${resource.title} on My Campus Library.`,
  }
}

export default async function ResourcePage({ params }: PageProps) {
  const { resourceId } = await params
  const { resource, user } = await getResourceData(resourceId)
  if (!resource) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <p>Custom Resource not found Code Resource not found</p>
      </main>
    )
  }

  const breadcrumbNode = generateBreadcrumbSchema([
    {
      name: 'Resource Details',
      url: `${baseUrl}/resource/${resource.id}`,
    },
  ])

  const jsonLd = createSchema([breadcrumbNode])

  const isResourceBookmarked =
    !!user &&
    resource.user_bookmarks.length > 0 &&
    resource.user_bookmarks.some((b: { user_id: string }) => b.user_id === user.id)

  return (
    <>
      <script
        id={`breadcrumb-resource-${resource.id}`}
        key={`breadcrumb-${resource.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ResourceClient resource={resource} user={user} initialBookmark={isResourceBookmarked} />
    </>
  )
}
