'use client'

import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Bug, Lightbulb, Upload, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type FeedbackType = 'bug' | 'feature' | null

export function FeedbackDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null)
  const [description, setDescription] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setFeedbackType(null)
    setDescription('')
    setScreenshot(null)
    setScreenshotPreview(null)
  }

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error('Screenshot must be less than 15MB')
        return
      }
      setScreenshot(file)
      const reader = new FileReader()
      reader.onloadend = () => setScreenshotPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removeScreenshot = () => {
    setScreenshot(null)
    setScreenshotPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!feedbackType || !description.trim()) {
      toast.error('Please select a type and provide a description')
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('type', feedbackType)
      formData.append('description', description.trim())
      if (screenshot) {
        formData.append('screenshot', screenshot)
      }

      const res = await fetch('/api/feedback', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      toast.success(
        feedbackType === 'bug'
          ? 'Bug report submitted! Thank you for helping us improve.'
          : 'Feature request submitted! We appreciate your suggestion.',
      )

      resetForm()
      setOpen(false)
    } catch (error) {
      console.error('Feedback submission error:', error)
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={isOpen => {
        setOpen(isOpen)
        if (!isOpen) resetForm()
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Help us improve by reporting bugs or suggesting new features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Type Selector */}
          <div className="space-y-2">
            <Label>What would you like to do?</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFeedbackType('bug')}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:border-red-400/50 hover:bg-red-500/5 ${
                  feedbackType === 'bug'
                    ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400'
                    : 'border-border text-muted-foreground'
                }`}
              >
                <Bug className="w-6 h-6" />
                <span className="text-sm font-medium">Report a Bug</span>
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('feature')}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:border-amber-400/50 hover:bg-amber-500/5 ${
                  feedbackType === 'feature'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'border-border text-muted-foreground'
                }`}
              >
                <Lightbulb className="w-6 h-6" />
                <span className="text-sm font-medium">Request a Feature</span>
              </button>
            </div>
          </div>

          {/* Description */}
          {feedbackType && (
            <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
              <Label htmlFor="feedback-description">
                {feedbackType === 'bug' ? 'What happened?' : 'What feature would you like?'}
              </Label>
              <Textarea
                id="feedback-description"
                placeholder={
                  feedbackType === 'bug'
                    ? 'Tell us about the issue you encountered...'
                    : 'Describe the feature you would like to see...'
                }
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
          )}

          {/* Screenshot Upload */}
          {feedbackType && (
            <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
              <Label>Screenshot (optional)</Label>
              {screenshotPreview ? (
                <div className="relative inline-block">
                  <img
                    src={screenshotPreview}
                    alt="Screenshot preview"
                    className="max-h-32 rounded-md border border-border"
                  />
                  <button
                    type="button"
                    onClick={removeScreenshot}
                    className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  <Upload className="w-4 h-4" />
                  Click to upload a screenshot
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleScreenshotChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!feedbackType || !description.trim() || submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
