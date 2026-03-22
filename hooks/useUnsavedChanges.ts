'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUnsavedDialog } from '@/components/providers/unsavedChangesProvider'

export function useUnsavedChanges(isDirty: boolean) {
  const router = useRouter()
  const { showDialog } = useUnsavedDialog()

  useEffect(() => {
    if (!isDirty) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    if (!isDirty) return

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target || !target.href) return

      if (target.target === '_blank' || target.origin !== window.location.origin) {
        return
      }

      if (
        target.pathname === window.location.pathname &&
        target.search === window.location.search
      ) {
        return
      }

      e.preventDefault()
      e.stopPropagation()

      showDialog(() => {
        router.push(target.pathname + target.search + target.hash)
      })
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [isDirty, showDialog, router])
}
