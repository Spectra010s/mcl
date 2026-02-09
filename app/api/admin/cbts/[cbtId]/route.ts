import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ cbtId: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { cbtId } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: cbt, error } = await supabaseAdmin
      .from('cbts')
      .select(
        `
        *,
        courses(
          id,
          course_code,
          course_title
        )
      `,
      )
      .eq('id', cbtId)
      .single()

    if (error) throw error
    if (!cbt) {
      return NextResponse.json({ error: 'CBT not found' }, { status: 404 })
    }

    return NextResponse.json(cbt)
  } catch (error) {
    console.error('Error fetching CBT:', error)
    return NextResponse.json({ error: 'Failed to fetch CBT' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { cbtId } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updates = await request.json()

    // Build update object with only allowed fields
    const allowedFields = [
      'title',
      'description',
      'time_limit_minutes',
      'passing_score',
      'is_active',
      'question_limit',
    ]
    const updateData: Record<string, unknown> = {}

    for (const field of allowedFields) {
      const camelKey = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      if (updates[camelKey] !== undefined) {
        updateData[field] = updates[camelKey]
      }
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('cbts')
      .update(updateData)
      .eq('id', cbtId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating CBT:', error)
    return NextResponse.json({ error: 'Failed to update CBT' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { cbtId } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabaseAdmin.from('cbts').delete().eq('id', cbtId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting CBT:', error)
    return NextResponse.json({ error: 'Failed to delete CBT' }, { status: 500 })
  }
}
