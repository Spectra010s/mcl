import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export interface Resource {
  id: number
  title: string
  description: string
  file_type: string
  file_size_bytes: number
  view_count: number
  download_count: number
  bookmark_count: number
  isBookmarked: boolean
  courses?: {
    id: number
    course_code: string
    course_title: string
    academic_levels: {
      level_number: number
      departments: {
        id: number
        full_name: string
        faculty_id: number
      }[]
    }[]
  }[]
}

interface DbResource extends Resource {
  user_bookmarks: { user_id: string }[] | null
}

export const fetchSearchUser = async (): Promise<User | null> => {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export const recordSearchQuery = async (query: string) => {
  await fetch('/api/search/record', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
}

export const searchResources = async (query: string, user: User | null): Promise<Resource[]> => {
  const supabase = createClient()

  const ResourceQuery = `
    *,
    user_bookmarks(user_id),
    courses(
      id,
      course_code,
      course_title,
      academic_levels(
        level_number,
        departments(id, full_name, faculty_id)
      )
    )
  `

  let { data, error } = await supabase
    .rpc('search_resources_fts', { search_term: query })
    .select(ResourceQuery)

  if (!error && (!data || data.length === 0)) {
    const fuzzy = await supabase
      .rpc('search_resources_keywords_fuzzy', { search_term: query })
      .select(ResourceQuery)

    data = fuzzy.data
    error = fuzzy.error
  }

  if (error) throw error
  return ((data as DbResource[]) || []).map(res => ({
    ...res,
    isBookmarked: !!user && (res.user_bookmarks?.some(b => b.user_id === user.id) ?? false),
    user_bookmarks: undefined,
  }))
}

export const toggleBookmark = async (resourceId: number) => {
  const response = await fetch(`/api/resources/${resourceId}/bookmark`, {
    method: 'POST',
  })
  if (!response.ok) throw new Error('Bookmark failed')
  return response.json()
}
