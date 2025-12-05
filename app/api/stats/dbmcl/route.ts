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

  try {
    const { count: resourceCount } = await supabaseAdmin
      .from('resources')
      .select('*', { count: 'exact', head: true })

    const { count: userCount } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: downloadCount } = await supabaseAdmin
      .from('download_history')
      .select('*', { count: 'exact', head: true })

    const { count: viewCount } = await supabaseAdmin
      .from('view_history')
      .select('*', { count: 'exact', head: true })

    const { count: pendingCount } = await supabaseAdmin
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', false)

    return NextResponse.json({
      resourceCount,
      userCount,
      downloadCount,
      viewCount,
      pendingCount,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
