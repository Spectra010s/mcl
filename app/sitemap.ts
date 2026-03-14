import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { baseUrl } from '@/constants'

export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: '2026-03-14', changeFrequency: 'daily', priority: 1 },
    {
      url: `${baseUrl}/about`,
      lastModified: '2026-03-14',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/browse/faculties`,
      lastModified: '2026-03-14',
      changeFrequency: 'daily',
      priority: 0.8,
    },
    { url: `${baseUrl}/cbts`, lastModified: '2026-03-14', changeFrequency: 'daily', priority: 0.8 },
    {
      url: `${baseUrl}/help`,
      lastModified: '2026-03-14',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: '2026-03-14',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: '2026-03-14',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: '2026-03-14',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: '2026-03-14',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // dynamic routes
  const [
    { data: faculties },
    { data: departments },
    { data: levels },
    { data: courses },
    { data: cbts },
    { data: resources },
  ] = await Promise.all([
    supabase.from('faculties').select('id, updated_at'),
    supabase.from('departments').select('id, faculty_id, updated_at'),
    supabase
      .from('academic_levels')
      .select('id, department_id, updated_at, departments(faculty_id)'),
    supabase
      .from('courses')
      .select(
        'id, academic_level_id, updated_at, academic_levels(department_id, departments(faculty_id))',
      ),
    supabase.from('cbts').select('id, updated_at').eq('is_active', true),
    supabase.from('resources').select('id, updated_at').eq('is_approved', true).limit(2000),
  ])

  const facultyRoutes = (faculties || []).map(f => ({
    url: `${baseUrl}/browse/faculties/${f.id}`,
    lastModified: new Date(f.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const departmentRoutes = (departments || []).map(d => ({
    url: `${baseUrl}/browse/faculties/${d.faculty_id}/departments/${d.id}`,
    lastModified: new Date(d.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const levelRoutes = (levels || []).map((l: any) => ({
    url: `${baseUrl}/browse/faculties/${l.departments?.faculty_id}/departments/${l.department_id}/levels/${l.id}`,
    lastModified: new Date(l.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  const courseRoutes = (courses || []).map((c: any) => {
    const level = c.academic_levels
    const facultyId = level?.departments?.faculty_id
    return {
      url: `${baseUrl}/browse/faculties/${facultyId}/departments/${level?.department_id}/levels/${c.academic_level_id}/courses/${c.id}`,
      lastModified: new Date(c.updated_at),
      changeFrequency: 'daily' as const,
      priority: 0.5,
    }
  })

  const cbtRoutes = (cbts || []).map(c => ({
    url: `${baseUrl}/cbts/${c.id}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))

  const resourceRoutes = (resources || []).map(r => ({
    url: `${baseUrl}/resource/${r.id}`,
    lastModified: new Date(r.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))

  return [
    ...staticRoutes,
    ...facultyRoutes,
    ...departmentRoutes,
    ...levelRoutes,
    ...courseRoutes,
    ...cbtRoutes,
    ...resourceRoutes,
  ]
}
