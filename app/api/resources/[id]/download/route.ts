import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: resourceId } = await params

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return new Response('Unauthorized', { status: 401 })

    const { data: resource, error: resourceError } = await supabase
      .from('resources')
      .select('file_url, title, file_type, download_count')
      .eq('id', resourceId)
      .eq('is_approved', true)
      .single()

    if (resourceError || !resource) {
      console.error('Resource not found:', resourceError)
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    await Promise.all([
      supabase.from('download_history').insert({ user_id: user.id, resource_id: resourceId }),
      supabase
        .from('resources')
        .update({ download_count: (resource.download_count || 0) + 1 })
        .eq('id', resourceId),
    ])

    if (!resource.file_url) throw new Error('Invalid URL')

    const { data: signed, error: signedError } = await supabase.storage
      .from('mclib')
      .createSignedUrl(resource.file_url, 60)

    if (signedError || !signed) {
      console.error('Signed URL error:', signedError)
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
    }

    const fileResponse = await fetch(signed.signedUrl)

    if (!fileResponse.ok) {
      return NextResponse.json({ error: 'File fetch failed' }, { status: fileResponse.status })
    }

    const extension = resource.file_type || 'pdf'
    const filename = `${resource.title}-MCL.${extension}`.replace(/[^a-zA-Z0-9._-]/g, '_')

    return new NextResponse(fileResponse.body, {
      status: 200,
      headers: {
        'Content-Type': fileResponse.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileResponse.headers.get('Content-Length') || '',
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
