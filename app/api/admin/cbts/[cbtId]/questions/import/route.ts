import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { parseSqf, validateParsedQuestions } from '@/lib/parser/sqf'

interface RouteParams {
  params: Promise<{ cbtId: string }>
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

    const { content } = await request.json()
    if (!content) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 })
    }

    const questionsArray = parseSqf(content)
    if (questionsArray.length === 0) {
      return NextResponse.json(
        { error: 'No valid questions found in SQF content' },
        { status: 400 },
      )
    }

    const validationErrors = validateParsedQuestions(questionsArray)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationErrors,
        },
        { status: 400 },
      )
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
      order_index: nextOrderIndex + index,
      shuffle_options: q.shuffleOptions,
    }))

    // Insert all questions
    const { data: insertedQuestions, error: questionsError } = await supabaseAdmin
      .from('questions')
      .insert(questionsToInsert)
      .select()

    if (questionsError) throw questionsError
    if (!insertedQuestions) throw new Error('Failed to insert questions')

    // Sort inserted questions by order_index to match original questionsArray order
    const sortedInsertedQuestions = [...insertedQuestions].sort(
      (a, b) => a.order_index - b.order_index,
    )

    // Prepare all options for all questions
    const allOptionsToInsert: any[] = []
    sortedInsertedQuestions.forEach((question, qIndex) => {
      const originalQuestion = questionsArray[qIndex]
      originalQuestion.options.forEach((opt, oIndex) => {
        allOptionsToInsert.push({
          question_id: question.id,
          option_text: opt.optionText,
          is_correct: opt.isCorrect,
          order_index: oIndex,
        })
      })
    })

    // Insert all options
    const { error: optionsError } = await supabaseAdmin
      .from('question_options')
      .insert(allOptionsToInsert)

    if (optionsError) throw optionsError

    return NextResponse.json(
      {
        success: true,
        count: insertedQuestions.length,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error bulk importing questions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
