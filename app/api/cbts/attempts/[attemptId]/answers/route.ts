import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ attemptId: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { attemptId } = await params
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { questionId, selectedOptionId } = await request.json()

    if (!questionId || !selectedOptionId) {
      return NextResponse.json(
        { error: 'Question ID and selected option ID are required' },
        { status: 400 },
      )
    }

    // Verify the attempt belongs to the user and is not completed
    const { data: attempt, error: attemptError } = await supabase
      .from('cbt_attempts')
      .select('id, completed_at')
      .eq('id', attemptId)
      .eq('user_id', user.id)
      .single()

    if (attemptError || !attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    if (attempt.completed_at) {
      return NextResponse.json({ error: 'Attempt is already completed' }, { status: 400 })
    }

    // Upsert the answer (insert or update if exists)
    const { error } = await supabase.from('user_answers').upsert(
      {
        attempt_id: attemptId,
        question_id: questionId,
        selected_option_id: selectedOptionId,
        answered_at: new Date().toISOString(),
      },
      { onConflict: 'attempt_id,question_id' },
    )

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving answer:', error)
    return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 })
  }
}
