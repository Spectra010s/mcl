import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ facultyId: string; departmentId: string; levelId: string }>
}

async function getCoursePageData(facultyId: string, departmentId: string, levelId: string) {
  const supabase = await createClient()

  const [facultyResult, deptResult, levelResult] = await Promise.all([
    supabase.from('faculties').select('short_name').eq('id', facultyId).single(),
    supabase
      .from('departments')
      .select(
        `
  short_name, 
  full_name`,
      )
      .eq('id', departmentId)
      .eq('faculty_id', facultyId)
      .single(),
    supabase
      .from('academic_levels')
      .select(
        `id, level_number, courses(id, course_code, course_title, description, resources(count))`,
      )
      .eq('id', levelId)
      .eq('department_id', departmentId)
      .single(),
  ])

  const error = facultyResult.error || deptResult.error || levelResult.error
  if (error) throw error

  return { faculty: facultyResult.data, dept: deptResult.data, level: levelResult.data }
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const { facultyId, departmentId, levelId } = params

  const { dept, level } = await getCoursePageData(facultyId, departmentId, levelId)

  const isGeneralCourse = dept?.full_name === 'General Courses'
  const title = isGeneralCourse
    ? `${level?.level_number} Lvl ${dept?.full_name} - My Campus Library`
    : `${level?.level_number} Lvl ${dept?.full_name} Department Courses - My Campus Library`
  const description = isGeneralCourse
    ? `Explore courses within the ${level?.level_number} lvl of ${dept?.full_name}`
    : `Explore courses within the ${level?.level_number} lvl of ${dept?.full_name} department`

  return {
    title,
    description,
  }
}

export default async function CoursesPage(props: PageProps) {
  const params = await props.params
  const { facultyId, departmentId, levelId } = params

  const { faculty, dept, level } = await getCoursePageData(facultyId, departmentId, levelId)

  const courses = level?.courses?.sort((a, b) => a.course_code.localeCompare(b.course_code)) || []

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 py-12 md:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/browse/faculties" className="text-primary hover:underline">
            <span>/Fa...</span>
          </Link>
          <span>/</span>
          <Link href={`/browse/faculties/${facultyId}`} className="text-primary hover:underline">
            {faculty?.short_name}
          </Link>
          <span>/</span>
          <Link
            href={`/browse/faculties/${facultyId}/departments/${departmentId}`}
            className="text-primary hover:underline"
          >
            {dept?.short_name}
          </Link>
          <span>/</span>
          <span>{level?.level_number} Lvl</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          {level?.level_number} Level Courses
        </h1>
        <p className="text-lg text-muted-foreground">
          {courses.length} course{courses.length !== 1 ? 's' : ''} available
        </p>
      </div>
      {/* Courses List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <Link
            key={course.id}
            href={`/browse/faculties/${facultyId}/departments/${departmentId}/levels/${levelId}/courses/${course.id}`}
          >
            <Card className="hover:border-primary hover:shadow-lg transition-all cursor-pointer p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">
                    {course.course_code}: {course.course_title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {course.resources?.[0]?.count || 0} resource
                    {course.resources?.[0]?.count !== 1 ? 's' : ''}
                  </div>
                </div>
                <span className="text-sm ml-4 text-primary">View →</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No courses available</p>
        </div>
      )}
    </main>
  )
}
