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
  const truncateText = (text: string, max: number) =>
    text.length > max ? `${text.substring(0, max)}...` : text
  const breadcrumbFaculty = truncateText(facultyName, 18)
  const breadcrumbDepartment = truncateText(departmentName, 18)
  const breadcrumbLevel = truncateText(String(levelNumber), 12)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  const iconUrl = `${baseUrl}/icon.png`

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
          padding: '80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Icon Watermark */}
        <div
          style={{
            position: 'absolute',
            top: 80,
            right: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={iconUrl}
            alt="Watermark"
            width="200"
            height="200"
            style={{
              borderRadius: '8px',
              objectFit: 'cover',
            }}
          />
        </div>
        {/* Header with branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              color: '#1e293b',
              fontWeight: '700',
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
            fontSize: '24px',
            color: '#64748b',
            maxWidth: '720px',
          }}
        >
          <span>{breadcrumbFaculty}</span>
          <span style={{ margin: '0 12px' }}>/</span>
          <span>{breadcrumbDepartment}</span>
          <span style={{ margin: '0 12px' }}>/</span>
          <span>{breadcrumbLevel}</span>
          <span style={{ margin: '0 12px' }}>/</span>
          <span style={{ color: '#0f172a', fontWeight: '800' }}>Course</span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            paddingBottom: '40px',
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
                fontSize: '24px',
                color: '#0256a5',
                backgroundColor: '#e6f2ff',
                padding: '8px 16px',
                borderRadius: '6px',
                marginRight: '16px',
                fontWeight: '600',
              }}
            >
              Course
            </div>
            {courseCode && (
              <div
                style={{
                  fontSize: '24px',
                  color: '#64748b',
                  fontWeight: '600',
                }}
              >
                {courseCode}
              </div>
            )}
          </div>

          <h1
            style={{
              fontSize: '40px',
              fontWeight: '700',
              color: '#020617',
              margin: '0 0 24px 0',
              lineHeight: '1.25',
              letterSpacing: '-0.02em',
              maxWidth: '780px',
            }}
          >
            {courseTitle}
          </h1>

          <p
            style={{
              fontSize: '24px',
              color: '#334155',
              lineHeight: '1.5',
              margin: '0',
              maxWidth: '780px',
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
            borderTop: '1px solid #e2e8f0',
            paddingTop: '18px',
            marginTop: 'auto',
            marginBottom: '16px',
          }}
        >
          <span style={{ fontSize: '20px', marginRight: '8px' }}>📄</span>
          <span style={{ fontSize: '20px', color: '#64748b' }}>View all course resources</span>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '12px',
            backgroundColor: '#1d4ed8',
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  )
}
