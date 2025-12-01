import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { fullName, username } = await request.json()

    const nameParts = fullName.trim().split(/\s+/)

    const firstName = nameParts[0]

    const lastName = nameParts.slice(1).join(' ')

    if (!fullName || !username) {
      return NextResponse.json({ error: 'A new field is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        username,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('[API] Update Error:', JSON.stringify(updateError, null, 2))
    }

    return NextResponse.json({
      success: true,
      message: 'User Profile Updated',
    })
  } catch (error) {
    console.error('[API] User update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
