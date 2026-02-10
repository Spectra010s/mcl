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
      .select('file_url, title, file_type, is_approved')
      .eq('id', resourceId)
      .single()

    if (resourceError || !resource || !resource.is_approved || !resource.file_url) {
      return NextResponse.json({ error: 'Resource not found or not approved' }, { status: 404 })
    }

    return NextResponse.json({
      signedUrl: `/api/resources/${resourceId}/view`,
      fileType: resource.file_type,
    })
  } catch (error) {
    console.error('Preview API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
