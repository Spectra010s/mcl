import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, Users, Download, Eye, Clock, CheckCircle } from 'lucide-react'

type Stats = {
  totalResources: number
  totalUsers: number
  totalDownloads: number
  totalViews: number
  pendingReviews: number
} | null

export default function AdminStats({ stats }: { stats: Stats }) {
  const displayStats = stats || {
    totalResources: 0,
    totalUsers: 0,
    totalDownloads: 0,
    totalViews: 0,
    pendingReviews: 0,
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Total Resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{displayStats.totalResources}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{displayStats.totalUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Total Downloads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{displayStats.totalDownloads}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Total Views
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{displayStats.totalViews}</p>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-primary">
              <Clock className="w-4 h-4" />
              Pending Reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{displayStats.pendingReviews}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Review Resources
            </CardTitle>
            <CardDescription>Approve or reject pending files submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/admin/reviews">
                Go to Reviews
                {displayStats.pendingReviews > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary-foreground text-primary rounded-full text-xs">
                    {displayStats.pendingReviews}
                  </span>
                )}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Manage Users
            </CardTitle>
            <CardDescription>View and manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Manage Content
            </CardTitle>
            <CardDescription>Add faculties, departments, and courses</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/faculties">Manage Content</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
