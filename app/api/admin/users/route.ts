import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

async function checkAdminAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 })

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
  }

  return null
}

export async function GET() {
  const authCheck = await checkAdminAuth()
  if (authCheck) return authCheck

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error)
    return NextResponse.json({ error: 'An Error occured while fetching users' }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const authCheck = await checkAdminAuth()
  if (authCheck) return authCheck

  const { userId, newRole } = await request.json()

  const { error } = await supabaseAdmin.from('users').update({ role: newRole }).eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: 'Updated successfully' }, { status: 200 })
}
