import AdminStats from '@/components/AdminStats'
import { createClient } from '@/lib/supabase/server'

type Stats = {
  totalResources: number
  totalUsers: number
  totalDownloads: number
  totalViews: number
  pendingReviews: number
  totalCBTs: number
  openFeedback: number
}

async function getStats(): Promise<Stats | null> {
  try {
    const supabase = await createClient()

    const [
      resourceResult,
      userResult,
      downloadResult,
      viewResult,
      pendingResult,
      cbtResult,
      feedbackResult,
    ] = await Promise.all([
      supabase.from('resources').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('download_history').select('*', { count: 'exact', head: true }),
      supabase.from('view_history').select('*', { count: 'exact', head: true }),
      supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false),
      supabase.from('cbts').select('*', { count: 'exact', head: true }),
      supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    ])

    return {
      totalResources: resourceResult.count || 0,
      totalUsers: userResult.count || 0,
      totalDownloads: downloadResult.count || 0,
      totalViews: viewResult.count || 0,
      pendingReviews: pendingResult.count || 0,
      totalCBTs: cbtResult.count || 0,
      openFeedback: feedbackResult.count || 0,
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return null
  }
}

export default async function AdminPage() {
  const stats = await getStats()

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Campus Library Management</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <AdminStats stats={stats} />
    </div>
  )
}
