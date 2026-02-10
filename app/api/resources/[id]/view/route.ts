import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: resourceId } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: resource, error: resourceError } = await supabase
      .from('resources')
      .select('file_url, is_approved')
      .eq('id', resourceId)
      .single()

    if (resourceError || !resource || !resource.is_approved || !resource.file_url) {
      return NextResponse.json({ error: 'Resource not found or not approved' }, { status: 404 })
    }

    // Generate internal signed URL
    const { data: signedData, error: signedError } = await supabase.storage
      .from('mclib')
      .createSignedUrl(resource.file_url, 60)

    if (signedError || !signedData) {
      console.error('Error generating internal signed URL:', signedError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    const fileResponse = await fetch(signedData.signedUrl)
    if (!fileResponse.ok) {
      console.error('File fetch failed:', fileResponse.status)
      return NextResponse.json({ error: 'File fetch failed' }, { status: fileResponse.status })
    }

    const contentType = fileResponse.headers.get('Content-Type') || 'application/octet-stream'

    return new NextResponse(fileResponse.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
        'Content-Length': fileResponse.headers.get('Content-Length') || '',
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    console.error('View proxy error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
