import { createClient } from '@/lib/supabase/server'
import AdminFeedback from '@/components/AdminFeedback'

export type Feedback = {
  id: number
  type: 'bug' | 'feature'
  description: string
  screenshot_url: string | null
  user_id: string | null
  user_name: string | null
  user_email: string | null
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
}

async function getFeedback(): Promise<Feedback[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return []
  }
}

export default async function AdminFeedbackPage() {
  const feedback = await getFeedback()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Feedback</h1>
            <p className="text-sm text-muted-foreground">
              Manage bug reports and feature requests from users
            </p>
          </div>
        </div>
      </header>

      <AdminFeedback initialFeedback={feedback} />
    </div>
  )
}
