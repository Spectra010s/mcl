import AdminStats from '@/components/AdminStats'

type Stats = {
  totalResources: number
  totalUsers: number
  totalDownloads: number
  totalViews: number
  pendingReviews: number
}

async function getStats(): Promise<Stats | null> {
  try {
    const response = await fetch(`/api/stats/dbmcl`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Failed to fetch stats:', response.status)
      return null
    }

    const { resourceCount, userCount, downloadCount, viewCount, pendingCount } =
      await response.json()

    return {
      totalResources: resourceCount || 0,
      totalUsers: userCount || 0,
      totalDownloads: downloadCount || 0,
      totalViews: viewCount || 0,
      pendingReviews: pendingCount || 0,
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
