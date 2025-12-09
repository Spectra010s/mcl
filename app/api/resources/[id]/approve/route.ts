import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendApprovalEmail } from '@/lib/email'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { data: resource } = await supabase
      .from('resources')
      .select('*, users:uploaded_by(email, username)')
      .eq('id', id)
      .single()

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    const { error: updateError } = await supabase
      .from('resources')
      .update({ is_approved: true, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (updateError) {
      console.error('[API] Update Error:', JSON.stringify(updateError, null, 2))
    }

    await sendApprovalEmail(
      resource.users.email,
      resource.users.username,
      resource.title,
      resource.id,
    )

    return NextResponse.json({
      success: true,
      message: 'Resource approved and user notified',
    })
  } catch (error) {
    console.error('[API] Approval error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
