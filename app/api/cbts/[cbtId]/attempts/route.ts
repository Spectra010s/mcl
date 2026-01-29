import { createClient } from '@/lib/supabase/server'
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

        const { data: attempts, error } = await supabase
            .from('cbt_attempts')
            .select('*')
            .eq('cbt_id', cbtId)
            .eq('user_id', user.id)
            .order('started_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(attempts || [])
    } catch (error) {
        console.error('Error fetching attempts:', error)
        return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 })
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

        // Check if CBT exists and is active
        const { data: cbt, error: cbtError } = await supabase
            .from('cbts')
            .select('id, is_active')
            .eq('id', cbtId)
            .single()

        if (cbtError || !cbt) {
            return NextResponse.json({ error: 'CBT not found' }, { status: 404 })
        }

        if (!cbt.is_active) {
            return NextResponse.json({ error: 'CBT is not active' }, { status: 400 })
        }

        // Check for existing incomplete attempt
        const { data: existingAttempt } = await supabase
            .from('cbt_attempts')
            .select('id')
            .eq('cbt_id', cbtId)
            .eq('user_id', user.id)
            .is('completed_at', null)
            .single()

        if (existingAttempt) {
            return NextResponse.json(
                { error: 'You have an incomplete attempt', attemptId: existingAttempt.id },
                { status: 409 },
            )
        }

        // Get the next attempt number
        const { data: lastAttempt } = await supabase
            .from('cbt_attempts')
            .select('attempt_number')
            .eq('cbt_id', cbtId)
            .eq('user_id', user.id)
            .order('attempt_number', { ascending: false })
            .limit(1)
            .single()

        const attemptNumber = lastAttempt ? lastAttempt.attempt_number + 1 : 1

        // Create the attempt
        const { data: attempt, error: attemptError } = await supabase
            .from('cbt_attempts')
            .insert({
                cbt_id: cbtId,
                user_id: user.id,
                attempt_number: attemptNumber,
            })
            .select()
            .single()

        if (attemptError) throw attemptError

        // Generate questions for this attempt using the RPC function
        const { error: generateError } = await supabase.rpc('generate_attempt_questions', {
            p_attempt_id: attempt.id,
        })

        if (generateError) throw generateError

        return NextResponse.json(attempt, { status: 201 })
    } catch (error) {
        console.error('Error creating attempt:', error)
        return NextResponse.json({ error: 'Failed to create attempt' }, { status: 500 })
    }
}
