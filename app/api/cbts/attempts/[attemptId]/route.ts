import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
    params: Promise<{ attemptId: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { attemptId } = await params
        const supabase = await createClient()

        const {
            data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify the attempt belongs to the user
        const { data: attempt, error: attemptError } = await supabase
            .from('cbt_attempts')
            .select(
                `
        *,
        cbts(
          id,
          title,
          time_limit_minutes,
          passing_score
        )
      `,
            )
            .eq('id', attemptId)
            .eq('user_id', user.id)
            .single()

        if (attemptError || !attempt) {
            return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
        }

        // If attempt is already completed, return attempt info only
        if (attempt.completed_at) {
            return NextResponse.json({
                attempt,
                questions: [],
                message: 'This attempt is already completed',
            })
        }

        // Get questions using the RPC function
        const { data: questions, error: questionsError } = await supabase.rpc(
            'get_questions_for_attempt',
            {
                p_attempt_id: attemptId,
            },
        )

        if (questionsError) throw questionsError

        // Get user's existing answers for this attempt
        const { data: answers, error: answersError } = await supabase
            .from('user_answers')
            .select('question_id, selected_option_id')
            .eq('attempt_id', attemptId)

        if (answersError) throw answersError

        // Create a map of question_id to selected_option_id
        const answersMap: Record<string, string> = {}
        answers?.forEach(answer => {
            answersMap[answer.question_id] = answer.selected_option_id
        })

        return NextResponse.json({
            attempt,
            questions,
            answers: answersMap,
        })
    } catch (error) {
        console.error('Error fetching attempt:', error)
        return NextResponse.json({ error: 'Failed to fetch attempt' }, { status: 500 })
    }
}
