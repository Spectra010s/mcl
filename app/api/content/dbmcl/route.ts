import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
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

  if (error) {
    console.error('[FacultyFetch] Error Occured:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const { type, data: formData, faculty_id } = await request.json()

  if (!type || !formData) {
    return NextResponse.json({ error: 'Missing type or data' }, { status: 400 })
  }

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
          faculty_id: faculty_id,
          full_name: formData.fullName,
          short_name: formData.shortName,
          description: formData.description,
        })
        .select()
    } else {
      return NextResponse.json({ error: 'Invalid table type' }, { status: 400 })
    }

    if (newData.error) {
      console.error('Error Occured:', newData.error)
      return NextResponse.json({ error: newData.error.message }, { status: 500 })
    }

    return NextResponse.json({ message: `${type} added successfully` }, { status: 201 })
  } catch (e) {
    console.error('Unexpected Error Occured:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
