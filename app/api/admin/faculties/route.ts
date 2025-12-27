import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
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

    const { data: faculties, error } = await supabase
      .from('faculties')
      .select('*, departments(count)')
      .order('full_name')

    if (error) throw error

    const formattedData = faculties.map(faculty => ({
      ...faculty,
      _count: {
        departments: faculty.departments[0]?.count || 0,
      },
      departments: undefined,
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching faculties:', error)
    return NextResponse.json({ error: 'Failed to fetch faculties' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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

    const { fullName, shortName, description } = await request.json()

    if (!shortName || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('faculties')
      .insert({
        short_name: shortName,
        full_name: fullName,
        description: description,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating faculty:', error)
    return NextResponse.json({ error: 'Failed to create faculty' }, { status: 500 })
  }
}
