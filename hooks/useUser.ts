'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

/**
 * Fetches the current authenticated user from Supabase.
 * This is the core fetcher used by the useUser hook.
 */
export interface DbUser {
  id: string
  role: 'admin' | 'user'
  username: string | null
  first_name: string | null
  last_name: string | null
}

export interface UserState {
  user: User | null
  profile: DbUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Fetches the current authenticated user and their profile.
 */
export const fetchUserWithProfile = async (): Promise<{
  user: User | null
  profile: DbUser | null
}> => {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { user: null, profile: null }
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, role, username, first_name, last_name')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Error fetching profile:', profileError.message)
    return { user, profile: null }
  }

  return { user, profile }
}

/**
 * A centralized hook to access the current authenticated user and their profile.
 */
export function useUser(): UserState {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: fetchUserWithProfile,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  })

  const user = data?.user ?? null
  const profile = data?.profile ?? null

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isError,
    error: error as Error | null,
    refetch,
  }
}
