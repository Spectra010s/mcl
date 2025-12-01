import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsComponents from '@/components/SettingsComponents'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error

  const { data: downloads } = await supabase
    .from('download_history')
    .select('*, resources(id, title, file_type)')
    .eq('user_id', user.id)
    .order('downloaded_at', { ascending: false })
    .limit(20)

  const { data: bookmarks } = await supabase
    .from('user_bookmarks')
    .select('*, resources(id, title, file_type)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: searches } = await supabase
    .from('search_history')
    .select('query, searched_at')
    .eq('user_id', user.id)
    .order('searched_at', { ascending: false })
    .limit(10)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
      <p className="text-muted-foreground mb-8">Manage your account and preferences</p>

      {/* TAB NAVIGATION */}
      <SettingsComponents
        initialSearches={searches || []}
        initialDownloads={downloads || []}
        initialBookmarks={bookmarks || []}
        initialProfile={profile}
      />
    </div>
  )
}
