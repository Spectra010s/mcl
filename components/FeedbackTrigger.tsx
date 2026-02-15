'use client'

import { FeedbackDialog } from '@/components/FeedbackDialog'

export function FeedbackTrigger() {
  return (
    <FeedbackDialog>
      <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        Report an Issue
      </button>
    </FeedbackDialog>
  )
}
