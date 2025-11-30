import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminResource from '@/components/AdminResource'

export default async function ReviewsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle size={64} className="text-destructive" />
        <h1 className="text-4xl font-bold text-foreground">403 Forbidden</h1>
        <p className="text-muted-foreground">You do not have permission to access this page.</p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    )
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle size={64} className="text-destructive" />
        <h1 className="text-4xl font-bold text-foreground">403 Forbidden</h1>
        <p className="text-muted-foreground">You do not have permission to access this page.</p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    )
  }

  const { data: pendingFiles, error: pendingError } = await supabase
    .from('resources')
    .select(
      `*, 
          courses(
          id,
          academic_levels(
          level_number
          )
          ),
          users:uploaded_by(email, username)`,
    )
    .eq('is_approved', false)
    .or("rejection_reason.is.null,rejection_reason.eq.''")
    .order('upload_date', { ascending: true })

  return <AdminResource initialResources={pendingFiles || []} />
}
