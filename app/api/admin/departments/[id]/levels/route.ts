import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()

    const { id: dept } = await params

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

    const { data: department } = await supabase
      .from('departments')
      .select('id, full_name, short_name')
      .eq('id', dept)
      .single()

    const { data: levels, error } = await supabase
      .from('academic_levels')
      .select('*, courses(count)')
      .eq('department_id', dept)
      .order('level_number')

    if (error) throw error

    const formattedData = levels.map(level => ({
      ...level,
      _count: {
        courses: level.courses[0]?.count || 0,
      },
      courses: undefined,
    }))

    return NextResponse.json({ department, levels: formattedData })
  } catch (error) {
    console.error('Error fetching levels:', error)
    return NextResponse.json({ error: 'Failed to fetch levels' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()

    const { id: dept } = await params

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

    const body = await request.json()
    const { level_number } = body

    const { data, error } = await supabaseAdmin
      .from('academic_levels')
      .insert({
        department_id: dept,
        level_number,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating level:', error)
    return NextResponse.json({ error: 'Failed to create level' }, { status: 500 })
  }
}
