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

    const { data: cbts, error } = await supabaseAdmin
      .from('cbts')
      .select(
        `
        *,
        courses!inner(
          id,
          course_code,
          course_title,
          academic_levels(
            level_number,
            departments(
              short_name,
              full_name
            )
          )
        ),
        questions(count)
      `,
      )
      .order('created_at', { ascending: false })

    if (error) throw error

    const formattedData = cbts.map(cbt => ({
      ...cbt,
      _count: {
        questions: cbt.questions[0]?.count || 0,
      },
      questions: undefined,
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching CBTs:', error)
    return NextResponse.json({ error: 'Failed to fetch CBTs' }, { status: 500 })
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

    const { courseId, title, description, timeLimitMinutes, passingScore, questionLimit } =
      await request.json()

    if (!courseId || !title) {
      return NextResponse.json({ error: 'Course ID and title are required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('cbts')
      .insert({
        course_id: courseId,
        title,
        description: description || null,
        time_limit_minutes: timeLimitMinutes || null,
        passing_score: passingScore || 70,
        question_limit: questionLimit || 0,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating CBT:', error)
    return NextResponse.json({ error: 'Failed to create CBT' }, { status: 500 })
  }
}
