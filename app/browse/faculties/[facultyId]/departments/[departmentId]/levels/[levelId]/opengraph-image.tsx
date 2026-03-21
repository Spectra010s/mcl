import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'
export const alt = 'Level Page'
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
  }>
}

export default async function Image(props: ImageProps) {
  const params = await props.params
  const { facultyId, departmentId, levelId } = params

  const supabase = await createClient()

  const [facultyResult, deptResult, levelResult] = await Promise.all([
    supabase.from('faculties').select('short_name, full_name').eq('id', facultyId).single(),
    supabase
      .from('departments')
      .select('short_name, full_name')
      .eq('id', departmentId)
      .eq('faculty_id', facultyId)
      .single(),
    supabase.from('academic_levels').select('level_number').eq('id', levelId).single(),
  ])

  const faculty = facultyResult.data
  const dept = deptResult.data
  const level = levelResult.data

  const levelName = level?.level_number || 'Level'
  const departmentName = dept?.full_name || 'Department'
  const facultyName = faculty?.full_name || 'Faculty'
  const truncateText = (text: string, max: number) =>
    text.length > max ? `${text.substring(0, max)}...` : text
  const breadcrumbFaculty = truncateText(facultyName, 22)
  const breadcrumbDepartment = truncateText(departmentName, 22)
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
          <span style={{ color: '#0f172a', fontWeight: '800' }}>Level</span>
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
              Academic Level
            </div>
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
            {levelName} Level: {departmentName}
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
            Browse courses for this academic level
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
          <div
            style={{
              fontSize: '20px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span style={{ marginRight: '8px' }}>📚</span>
            <span>Explore Courses</span>
          </div>
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
