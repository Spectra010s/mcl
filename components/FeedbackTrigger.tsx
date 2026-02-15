'use client'

import { FeedbackDialog } from '@/components/FeedbackDialog'
import { Button } from '@/components/ui/button'

export function FeedbackTrigger() {
  return (
    <FeedbackDialog>
      <Button
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
        variant="link"
      >
        Report an Issue
      </Button>
    </FeedbackDialog>
  )
}
