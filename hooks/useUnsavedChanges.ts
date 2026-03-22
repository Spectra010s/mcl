'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUnsavedDialog } from '@/components/providers/unsaved-changes-provider'

export function useUnsavedChanges(isDirty: boolean) {
  const router = useRouter()
  const { showDialog } = useUnsavedDialog()

  // Native Browser Protection (Catching page reloads, tab closures, and external navigations)
  useEffect(() => {
    if (!isDirty) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = '' // Required by modern browsers to trigger the native warning
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Next.js App Router Interception (Catching internal <Link> clicks globally)
  useEffect(() => {
    if (!isDirty) return

    const handleClick = (e: MouseEvent) => {
      // Find the closest anchor tag that was clicked
      const target = (e.target as HTMLElement).closest('a')
      if (!target || !target.href) return

      // Do not intercept links that open in a new tab or point externally
      if (target.target === '_blank' || target.origin !== window.location.origin) {
        return
      }

      // Do not intercept links that just change the #hash on the same exact page
      if (
        target.pathname === window.location.pathname &&
        target.search === window.location.search
      ) {
        return
      }

      // It's a valid internal navigation that would destroy progress!
      // Stop Next.js from capturing it:
      e.preventDefault()
      e.stopPropagation()

      // Pop open our beautifully styled Warning Dialog
      showDialog(() => {
        // If the user clicks "Leave Anyhow", manually execute the router push
        router.push(target.pathname + target.search + target.hash)
      })
    }

    // The 'capture: true' flag guarantees our interceptor fires BEFORE Next.js's router listeners
    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [isDirty, showDialog, router])
}
