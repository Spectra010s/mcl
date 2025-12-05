import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

async function checkAdminAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 })

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
  }

  return null
}

export async function GET() {
  const authCheck = await checkAdminAuth()
  if (authCheck) return authCheck

  const { data, error } = await supabaseAdmin
    .from('faculties')
    .select(
      `
      *,
      departments(
        *,
        academic_levels(*)
      )
    `,
    )
    .order('full_name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const authCheck = await checkAdminAuth()
  if (authCheck) return authCheck

  const { type, data: formData, faculty_id } = await request.json()
  if (!type || !formData)
    return NextResponse.json({ error: 'Missing type or data' }, { status: 400 })

  let newData
  try {
    if (type === 'faculty') {
      newData = await supabaseAdmin
        .from('faculties')
        .insert({
          full_name: formData.fullName,
          short_name: formData.shortName,
          description: formData.description,
        })
        .select()
    } else if (type === 'department') {
      if (!faculty_id) return NextResponse.json({ error: 'Missing faculty_id' }, { status: 400 })

      newData = await supabaseAdmin
        .from('departments')
        .insert({
          faculty_id,
          full_name: formData.fullName,
          short_name: formData.shortName,
          description: formData.description,
        })
        .select()
    } else {
      return NextResponse.json({ error: 'Invalid table type' }, { status: 400 })
    }

    if (newData.error) return NextResponse.json({ error: newData.error.message }, { status: 500 })

    return NextResponse.json({ message: `${type} added successfully` }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
