import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { SettingsIcon } from 'lucide-react'
import Link from 'next/link'
import AdminStats from '@/components/AdminStats'

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
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

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()

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
      <AdminStats />
    </div>
  )
}
