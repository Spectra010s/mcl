import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'
export const alt = 'Faculty Page'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

interface ImageProps {
  params: Promise<{ facultyId: string }>
}

export default async function Image(props: ImageProps) {
  const params = await props.params
  const { facultyId } = params

  const supabase = await createClient()
  const { data: faculty } = await supabase
    .from('faculties')
    .select('full_name, short_name, description')
    .eq('id', facultyId)
    .single()

  const facultyName = faculty?.full_name || 'Faculty'
  const shortName = faculty?.short_name || ''
  const description = faculty?.description || 'Explore departments and courses'

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
        {/* Background Watermark */}
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
            marginBottom: '60px',
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
              Faculty
            </div>
            {shortName && (
              <div
                style={{
                  fontSize: '24px',
                  color: '#64748b',
                  fontWeight: '600',
                }}
              >
                {shortName}
              </div>
            )}
          </div>

          <h1
            style={{
              fontSize: '64px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 32px 0',
              lineHeight: '1.1',
              letterSpacing: '-0.02em',
            }}
          >
            {facultyName}
          </h1>

          <p
            style={{
              fontSize: '32px',
              color: '#334155',
              lineHeight: '1.5',
              margin: '0',
              maxWidth: '1000px',
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
          <div
            style={{
              fontSize: '20px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span style={{ marginRight: '8px' }}>🏛️</span>
            <span>Explore Departments</span>
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
