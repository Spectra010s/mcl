import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mycampuslib.vercel.app'
  const supabase = await createClient()

  // 1. Static Routes
  const routes = [
    '',
    '/about',
    '/browse/faculties',
    '/cbts',
    '/help',
    '/login',
    '/privacy',
    '/signup',
    '/terms',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // 2. Fetch Dynamic Data in Parallel
  const [
    { data: faculties },
    { data: departments },
    { data: levels },
    { data: courses },
    { data: cbts },
    { data: resources },
  ] = await Promise.all([
    supabase.from('faculties').select('id'),
    supabase.from('departments').select('id, faculty_id'),
    supabase.from('academic_levels').select(`
      id, 
      department_id,
      departments:department_id (
        faculty_id
      )
    `),
    supabase.from('courses').select(`
      id, 
      academic_level_id,
      academic_levels:academic_level_id (
        department_id,
        departments:department_id (
          faculty_id
        )
      )
    `),
    supabase.from('cbts').select('id').eq('is_active', true),
    supabase.from('resources').select('id').eq('is_approved', true).limit(2000),
  ])

  // Map Faculties
  const facultyRoutes = (faculties || []).map(f => ({
    url: `${baseUrl}/browse/faculties/${f.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Map Departments
  const departmentRoutes = (departments || []).map(d => ({
    url: `${baseUrl}/browse/faculties/${d.faculty_id}/departments/${d.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Map Academic Levels
  const levelRoutes = (levels || []).map((l: any) => {
    const dept = Array.isArray(l.departments) ? l.departments[0] : l.departments
    return {
      url: `${baseUrl}/browse/faculties/${dept?.faculty_id}/departments/${l.department_id}/levels/${l.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }
  })

  // Map Courses
  const courseRoutes = (courses || []).map((c: any) => {
    const level = Array.isArray(c.academic_levels) ? c.academic_levels[0] : c.academic_levels
    const dept = Array.isArray(level?.departments) ? level.departments[0] : level?.departments
    return {
      url: `${baseUrl}/browse/faculties/${dept?.faculty_id}/departments/${level?.department_id}/levels/${c.academic_level_id}/courses/${c.id}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.5,
    }
  })

  // Map CBTs
  const cbtRoutes = (cbts || []).map(c => ({
    url: `${baseUrl}/cbts/${c.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))

  // Map Resources
  const resourceRoutes = (resources || []).map(r => ({
    url: `${baseUrl}/resource/${r.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))

  return [
    ...routes,
    ...facultyRoutes,
    ...departmentRoutes,
    ...levelRoutes,
    ...courseRoutes,
    ...cbtRoutes,
    ...resourceRoutes,
  ]
}
