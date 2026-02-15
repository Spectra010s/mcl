import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: Promise<{ facultyId: string; departmentId: string }>
}

// Fetch department and its academic levels
async function getDepartmentData(departmentId: string, facultyId: string) {
  const supabase = await createClient()

  const [facultyResult, deptResult] = await Promise.all([
    supabase.from('faculties').select('short_name, full_name').eq('id', facultyId).single(),

    supabase
      .from('departments')
      .select(
        `
      id,
      short_name, 
      full_name,
      description,
      academic_levels(
        id,
        level_number,
        courses(count)
      )
    `,
      )
      .eq('id', departmentId)
      .eq('faculty_id', facultyId)
      .single(),
  ])

  const error = facultyResult.error || deptResult.error

  if (error) throw error

  return { faculty: facultyResult.data, dept: deptResult.data }
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const { departmentId, facultyId } = params

  const { faculty, dept } = await getDepartmentData(departmentId, facultyId)

  const isGeneralCourse = dept?.full_name?.startsWith('General Courses')
  const title = isGeneralCourse
    ? `${dept?.full_name} - My Campus Library`
    : `${dept?.full_name} Department - My Campus Library`
  const description = isGeneralCourse
    ? `Explore levels within the ${dept?.full_name} of ${faculty?.full_name}`
    : `Explore levels within the ${dept?.full_name} department of ${faculty?.full_name}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: `/browse/faculties/${facultyId}/departments/${departmentId}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/browse/faculties/${facultyId}/departments/${departmentId}/opengraph-image`],
    },
  }
}

export default async function AcademicLevelsPage(props: PageProps) {
  const params = await props.params
  const { facultyId, departmentId } = params

  const { faculty, dept } = await getDepartmentData(departmentId, facultyId)
  const levels = (dept?.academic_levels || [])
    .map(level => ({
      ...level,
      courseCount: level.courses?.[0]?.count || 0,
    }))
    .sort((a, b) => a.level_number - b.level_number)

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 py-12 md:px-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/browse/faculties" className="text-primary hover:underline">
            Faculties
          </Link>
          <span>/</span>
          <Link href={`/browse/faculties/${facultyId}`} className="text-primary hover:underline">
            {faculty?.short_name}
          </Link>
          <span>/</span>
          <span>{dept?.short_name}</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">{dept?.full_name}</h1>
        {dept?.description && <p className="text-lg text-muted-foreground">{dept.description}</p>}
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-6">Academic Levels</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {levels.map(level => (
          <Link
            key={level.id}
            href={`/browse/faculties/${facultyId}/departments/${departmentId}/levels/${level.id}`}
          >
            <Card className="h-full hover:border-primary hover:shadow-lg transition-all cursor-pointer p-4">
              <h3 className="font-semibold text-foreground text-lg mb-2">
                {level.level_number} Level
              </h3>
              <p className="text-sm text-muted-foreground mb-1">
                {level.courseCount} courses available
              </p>
              <Button size="sm" variant="ghost" className="text-primary">
                Browse Courses →
              </Button>
            </Card>
          </Link>
        ))}
      </div>

      {levels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No academic levels available</p>
        </div>
      )}
    </main>
  )
}
