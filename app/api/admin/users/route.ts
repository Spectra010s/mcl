import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (profile.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized User' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'An Error occured while fetching users' }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const { userId, newRole } = await request.json()

  const { error } = await supabaseAdmin.from('users').update({ role: newRole }).eq('id', userId)

  return NextResponse.json({ success: 'Updated successfully' }, { status: 200 })
}
