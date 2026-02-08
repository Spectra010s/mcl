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
      .select('file_url, file_type, is_approved')
      .eq('id', resourceId)
      .single()

    if (resourceError || !resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    if (!resource.is_approved) {
      return NextResponse.json({ error: 'Resource not approved' }, { status: 403 })
    }

    if (!resource.file_url) {
      return NextResponse.json({ error: 'Source file not found' }, { status: 404 })
    }

    // Generate a signed URL for preview (valid for 1 hour)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('mclib')
      .createSignedUrl(resource.file_url, 3600)

    if (signedError || !signedData) {
      console.error('Error generating signed URL:', signedError)
      return NextResponse.json({ error: 'Failed to generate preview URL' }, { status: 500 })
    }

    return NextResponse.json({
      signedUrl: signedData.signedUrl,
      fileType: resource.file_type,
    })
  } catch (error) {
    console.error('Preview API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
