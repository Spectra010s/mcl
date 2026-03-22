import { useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

export function useQueryToast() {
  const searchParams = useSearchParams()
  const hasShown = useRef(false)

  useEffect(() => {
    const message = searchParams.get('toast_message')
    if (message && !hasShown.current) {
      hasShown.current = true
      toast.info('Authentication Required', {
        description: message,
      })

      // Clean up the URL to prevent the toast from showing again on refresh
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('toast_message')
      const newQuery = newParams.toString()
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}`
      window.history.replaceState(null, '', newUrl)
    }
  }, [searchParams])
}
