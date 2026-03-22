'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, Suspense } from 'react'
import { toast } from 'sonner'

export interface RestoreData {
  title: string
  description: string
  facultyId: string
  departmentId: string
  levelId: string
  courseId: string
}

function FormRestorerLogic({ onRestore }: { onRestore: (data: RestoreData) => void }) {
  const searchParams = useSearchParams()
  const hasRestoredToast = useRef(false)

  useEffect(() => {
    const hasData =
      searchParams.get('title') ||
      searchParams.get('fileName') ||
      searchParams.get('facultyId') ||
      searchParams.get('description')

    if (hasData && !hasRestoredToast.current) {
      hasRestoredToast.current = true

      onRestore({
        title: searchParams.get('title') || '',
        description: searchParams.get('description') || '',
        facultyId: searchParams.get('facultyId') || '',
        departmentId: searchParams.get('departmentId') || '',
        levelId: searchParams.get('levelId') || '',
        courseId: searchParams.get('courseId') || '',
      })

      const fileName = searchParams.get('fileName')
      const restorationMessage = fileName
        ? `We've restored your form. Please re-select "${fileName}" to finish your upload.`
        : "We've restored your form progress. You can now complete your upload."

      toast.info('Welcome back!', {
        description: restorationMessage,
        duration: 8000,
      })

      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('title')
      newParams.delete('description')
      newParams.delete('facultyId')
      newParams.delete('departmentId')
      newParams.delete('levelId')
      newParams.delete('courseId')
      newParams.delete('fileName')
      const newQuery = newParams.toString()
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ''}`
      window.history.replaceState(null, '', newUrl)
    }
  }, [searchParams, onRestore])

  return null
}

export default function FormRestorer({ onRestore }: { onRestore: (data: RestoreData) => void }) {
  return (
    <Suspense fallback={null}>
      <FormRestorerLogic onRestore={onRestore} />
    </Suspense>
  )
}
