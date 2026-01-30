import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteParams {
    params: Promise<{ cbtId: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { cbtId } = await params
        const supabase = await createClient()

        const { data: cbt, error } = await supabase
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
        )
      `,
            )
            .eq('id', cbtId)
            .eq('is_active', true)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'CBT not found' }, { status: 404 })
            }
            throw error
        }

        return NextResponse.json(cbt)
    } catch (error) {
        console.error('Error fetching CBT:', error)
        return NextResponse.json({ error: 'Failed to fetch CBT' }, { status: 500 })
    }
}
