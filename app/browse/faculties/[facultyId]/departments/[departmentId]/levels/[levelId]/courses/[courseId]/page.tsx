import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ResourceCarousel } from '@/components/ResourceCarousel'
import { ChevronLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ facultyId: string; departmentId: string; levelId: string; courseId: string }>
}

async function getCourseDetailPageData(
  facultyId: string,
  departmentId: string,
  levelId: string,
  courseId: string,
) {
  const supabase = await createClient()

  const [deptResult, levelResult, courseResult, assessmentResult] = await Promise.all([
    supabase
      .from('departments')
      .select('full_name')
      .eq('id', departmentId)
      .eq('faculty_id', facultyId)
      .single(),
    supabase
      .from('academic_levels')
      .select(`id, level_number`)
      .eq('id', levelId)
      .eq('department_id', departmentId)
      .single(),
    supabase
      .from('courses')
      .select(
        `
      id,
      course_code,
      course_title,
      description,
      resources(
        id,
        title,
        file_type,
        download_count,
        upload_date,
        is_approved
      )
    `,
      )
      .eq('id', courseId)
      .single(),
    supabase
      .from('assessments')
      .select('id, title, description, time_limit_minutes, passing_score')
      .eq('course_id', courseId)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
  ])

  const error = deptResult.error || levelResult.error || courseResult.error
  if (error) throw error

  return {
    dept: deptResult.data,
    level: levelResult.data,
    course: courseResult.data,
    assessments: assessmentResult.data || [],
  }
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const { facultyId, departmentId, levelId, courseId } = params

  const { dept, level, course } = await getCourseDetailPageData(
    facultyId,
    departmentId,
    levelId,
    courseId,
  )
  const isGeneralCourse = dept?.full_name === 'General Courses'
  const description = `Explore the list of resources for ${course?.course_title} in ${level?.level_number} lvl${
    isGeneralCourse ? '' : ` for ${dept?.full_name} department`
  }`

  return {
    title: `${course?.course_title} | ${level?.level_number} lvl - My Campus Library`,
    description,
  }
}

export default async function CourseDetailPage(props: PageProps) {
  const params = await props.params
  const { facultyId, departmentId, levelId, courseId } = params

  const { course, assessments } = await getCourseDetailPageData(
    facultyId,
    departmentId,
    levelId,
    courseId,
  )

  const approvedResources = course?.resources?.filter(r => r.is_approved) || []

  const groupedByType: { [key: string]: typeof approvedResources } = {}
  approvedResources.forEach(resource => {
    const type = resource.file_type || 'other'
    if (!groupedByType[type]) groupedByType[type] = []
    groupedByType[type].push(resource)
  })

  const fileTypeOrder = [
    'pdf',
    'document',
    'presentation',
    'video',
    'audio',
    'image',
    'text',
    'other',
  ]
  const sortedTypes = Object.keys(groupedByType).sort(
    (a, b) => fileTypeOrder.indexOf(a) - fileTypeOrder.indexOf(b),
  )

  const getFileTypeTitle = (type: string) => {
    const titles: { [key: string]: string } = {
      pdf: 'PDF Files',
      document: 'Documents',
      presentation: 'Presentations',
      video: 'Videos',
      audio: 'Audio Files',
      image: 'Images',
      text: 'Text Files',
      other: 'Other Files',
    }
    return titles[type] || 'Files'
  }

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 py-12 md:px-6">
      <div className="mb-12">
        <Link
          href={`/browse/faculties/${facultyId}/departments/${departmentId}/levels/${levelId}`}
          className="flex items-center gap-2 text-primary hover:underline mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Level
        </Link>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          {course?.course_code}: {course?.course_title}
        </h1>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl">{course?.description}</p>

        <div className="flex flex-wrap gap-3 items-center mb-6">
          <p className="text-sm text-muted-foreground">
            {approvedResources.length} resource{approvedResources.length !== 1 ? 's' : ''} available
          </p>
          {assessments.length > 0 && (
            <>
              <span className="text-muted-foreground">•</span>
              <Link href={`/assessment/${assessments[0].id}`}>
                <Button variant="default" size="sm">
                  Test Your Knowledge
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {sortedTypes.length > 0 ? (
        <div className="space-y-12">
          {sortedTypes.map(type => (
            <ResourceCarousel
              key={type}
              title={getFileTypeTitle(type)}
              resources={groupedByType[type]}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No resources available yet</p>
          <Link href="/upload">
            <Button>Be the first to upload</Button>
          </Link>
        </div>
      )}
    </main>
  )
}
