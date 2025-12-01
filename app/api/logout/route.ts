import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Logout failed:', error)

    return NextResponse.json({ message: 'Logout failed' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Successfully logged out' }, { status: 200 })
}
