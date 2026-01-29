import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()

        const { data: cbts, error } = await supabase
            .from('cbts')
            .select(
                `
        id,
        title,
        description,
        time_limit_minutes,
        passing_score,
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
            .eq('is_active', true)
            .order('created_at', { ascending: false })

        if (error) throw error

        const formattedData = cbts.map(cbt => ({
            ...cbt,
            questionCount: cbt.questions[0]?.count || 0,
            questions: undefined,
        }))

        return NextResponse.json(formattedData)
    } catch (error) {
        console.error('Error fetching CBTs:', error)
        return NextResponse.json({ error: 'Failed to fetch CBTs' }, { status: 500 })
    }
}
