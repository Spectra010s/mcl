import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'
export const alt = 'Course Page'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

interface ImageProps {
  params: Promise<{
    facultyId: string
    departmentId: string
    levelId: string
    courseId: string
  }>
}

export default async function Image(props: ImageProps) {
  const params = await props.params
  const { facultyId, departmentId, levelId, courseId } = params

  const supabase = await createClient()

  const [facultyResult, deptResult, levelResult, courseResult] = await Promise.all([
    supabase.from('faculties').select('full_name').eq('id', facultyId).single(),
    supabase.from('departments').select('full_name').eq('id', departmentId).single(),
    supabase.from('academic_levels').select('level_number').eq('id', levelId).single(),
    supabase
      .from('courses')
      .select('course_code, course_title, description')
      .eq('id', courseId)
      .single(),
  ])

  const faculty = facultyResult.data
  const dept = deptResult.data
  const level = levelResult.data
  const course = courseResult.data

  const courseCode = course?.course_code || 'COURSE'
  const courseTitle = course?.course_title || 'Course'
  const description = course?.description || 'Explore course resources'
  const levelNumber = level?.level_number || 'Level'
  const departmentName = dept?.full_name || 'Department'
  const facultyName = faculty?.full_name || 'Faculty'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          padding: '80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header with branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '60px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#0256a5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: '700',
            }}
          >
            MCL
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#64748b',
              fontWeight: '600',
            }}
          >
            My Campus Library
          </div>
        </div>

        {/* Breadcrumb */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '24px',
            fontSize: '16px',
            color: '#94a3b8',
          }}
        >
          <span>{facultyName}</span>
          <span style={{ margin: '0 8px' }}>/</span>
          <span>{departmentName}</span>
          <span style={{ margin: '0 8px' }}>/</span>
          <span>{levelNumber}</span>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: '#64748b', fontWeight: '500' }}>Course</span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                color: '#0256a5',
                backgroundColor: '#e6f2ff',
                padding: '8px 16px',
                borderRadius: '6px',
                marginRight: '16px',
                fontWeight: '500',
              }}
            >
              Course
            </div>
            {courseCode && (
              <div
                style={{
                  fontSize: '18px',
                  color: '#94a3b8',
                  fontWeight: '500',
                }}
              >
                {courseCode}
              </div>
            )}
          </div>

          <h1
            style={{
              fontSize: '56px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 32px 0',
              lineHeight: '1.1',
              letterSpacing: '-0.02em',
            }}
          >
            {courseTitle}
          </h1>

          <p
            style={{
              fontSize: '28px',
              color: '#475569',
              lineHeight: '1.6',
              margin: '0',
            }}
          >
            {description.length > 140 ? `${description.substring(0, 140)}...` : description}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingTop: '40px',
            borderTop: '1px solid #e2e8f0',
            marginTop: 'auto',
          }}
        >
          <span style={{ fontSize: '20px', marginRight: '8px' }}>📄</span>
          <span style={{ fontSize: '20px', color: '#94a3b8' }}>View all course resources</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
