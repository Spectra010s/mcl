import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendRejectionEmail } from '@/lib/email'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { reason } = await request.json()

    if (!reason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

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
      .update({
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) throw updateError

    await sendRejectionEmail(resource.users.email, resource.users.username, resource.title, reason)

    return NextResponse.json({
      success: true,
      message: 'Resource rejected and user notified',
    })
  } catch (error) {
    console.error('[API] Rejection error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
