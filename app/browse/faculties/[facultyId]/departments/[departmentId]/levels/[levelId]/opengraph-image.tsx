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
            fontSize: '18px',
            color: '#94a3b8',
          }}
        >
          <span>{facultyName}</span>
          <span style={{ margin: '0 12px' }}>/</span>
          <span>{departmentName}</span>
          <span style={{ margin: '0 12px' }}>/</span>
          <span style={{ color: '#64748b', fontWeight: '500' }}>Level</span>
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
              fontSize: '18px',
              color: '#0256a5',
              backgroundColor: '#e6f2ff',
              padding: '8px 16px',
              borderRadius: '6px',
              marginBottom: '24px',
              fontWeight: '500',
            }}
          >
            Academic Level
          </div>

          <h1
            style={{
              fontSize: '68px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 32px 0',
              lineHeight: '1.1',
              letterSpacing: '-0.02em',
            }}
          >
            {levelName} Level: {departmentName}
          </h1>

          <p
            style={{
              fontSize: '28px',
              color: '#475569',
              lineHeight: '1.6',
              margin: '0',
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
            paddingTop: '40px',
            borderTop: '1px solid #e2e8f0',
            marginTop: 'auto',
          }}
        >
          <span style={{ fontSize: '20px', marginRight: '8px' }}>📚</span>
          <span style={{ fontSize: '20px', color: '#94a3b8' }}>Explore courses and resources</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
