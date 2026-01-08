import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CbtCl from './client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CbtPage(props: PageProps) {
  const params = await props.params
  const { id } = params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?returnTo=/cbt/${id}`)
  }

  return <CbtCl />
}
