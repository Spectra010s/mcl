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

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()

  if (!user || profile.role !== 'admin') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>403 Forbidden</h1>
        <p>Access denied. Insufficient privileges.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
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
