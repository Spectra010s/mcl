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

    const { data: questions, error } = await supabaseAdmin
      .from('questions')
      .select(
        `
        *,
        question_options(
          id,
          option_text,
          is_correct,
          order_index
        )
      `,
      )
      .eq('cbt_id', cbtId)
      .order('order_index', { ascending: true })

    if (error) throw error

    return NextResponse.json(questions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: RouteParams) {
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

    const body = await request.json()
    const questionsArray = Array.isArray(body) ? body : [body]

    if (questionsArray.length === 0) {
      return NextResponse.json({ error: 'No questions provided' }, { status: 400 })
    }

    // Validate all questions
    for (const q of questionsArray) {
      if (!q.questionText || !q.questionType) {
        return NextResponse.json(
          { error: 'Question text and type are required for all questions' },
          { status: 400 },
        )
      }
      if (!q.options || q.options.length < 2) {
        return NextResponse.json(
          { error: 'At least 2 options are required for all questions' },
          { status: 400 },
        )
      }
      const hasCorrectAnswer = q.options.some((opt: { isCorrect: boolean }) => opt.isCorrect)
      if (!hasCorrectAnswer) {
        return NextResponse.json(
          { error: 'At least one option must be marked as correct for all questions' },
          { status: 400 },
        )
      }
    }

    // Get the next order index
    const { data: lastQuestion } = await supabaseAdmin
      .from('questions')
      .select('order_index')
      .eq('cbt_id', cbtId)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle()

    let nextOrderIndex = lastQuestion ? lastQuestion.order_index + 1 : 0

    // Prepare questions for insertion
    const questionsToInsert = questionsArray.map((q, index) => ({
      cbt_id: cbtId,
      question_text: q.questionText,
      question_type: q.questionType,
      points: q.points || 1,
      explanation: q.explanation || null,
      shuffle_options: q.shuffleOptions || false,
      order_index: nextOrderIndex + index,
    }))

    // Insert all questions
    const { data: insertedQuestions, error: questionsError } = await supabaseAdmin
      .from('questions')
      .insert(questionsToInsert)
      .select()

    if (questionsError) throw questionsError
    if (!insertedQuestions) throw new Error('Failed to insert questions')

    // Prepare all options for all questions
    const allOptionsToInsert: any[] = []
    insertedQuestions.forEach((question, qIndex) => {
      const originalQuestion = questionsArray[qIndex]
      originalQuestion.options.forEach(
        (opt: { optionText: string; isCorrect: boolean }, oIndex: number) => {
          allOptionsToInsert.push({
            question_id: question.id,
            option_text: opt.optionText,
            is_correct: opt.isCorrect,
            order_index: oIndex,
          })
        },
      )
    })

    // Insert all options
    const { error: optionsError } = await supabaseAdmin
      .from('question_options')
      .insert(allOptionsToInsert)

    if (optionsError) throw optionsError

    // Fetch the full questions with options to return
    const insertedIds = insertedQuestions.map(q => q.id)
    const { data: fullQuestions, error: fetchError } = await supabaseAdmin
      .from('questions')
      .select(
        `
                *,
                question_options(
                    id,
                    option_text,
                    is_correct,
                    order_index
                )
            `,
      )
      .in('id', insertedIds)
      .order('order_index', { ascending: true })

    if (fetchError) throw fetchError

    return NextResponse.json(Array.isArray(body) ? fullQuestions : fullQuestions[0], {
      status: 201,
    })
  } catch (error) {
    console.error('Error creating questions:', error)
    return NextResponse.json({ error: 'Failed to create questions' }, { status: 500 })
  }
}
