import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import { X, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const PdfViewer = dynamic(() => import('./PdfViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-muted/20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
})

interface ResourcePreviewProps {
  isOpen: boolean
  onClose: () => void
  title: string
  fileUrl: string
  fileType: string
}

type ViewMode = 'standard' | 'fullscreen' | 'pip'

export function ResourcePreview({
  isOpen,
  onClose,
  title,
  fileUrl,
  fileType,
}: ResourcePreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('standard')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setViewMode('standard')
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  const isPDF = fileType.toLowerCase() === 'pdf'
  const isImage = fileType.toLowerCase().match(/png|jpg|jpeg|gif|webp|svg/)

  return createPortal(
    <div
      className={cn(
        'fixed z-[100] transition-all duration-300 ease-in-out flex flex-col bg-background shadow-2xl overflow-hidden',

        // Layout Logic
        viewMode === 'fullscreen'
          ? 'fixed inset-0 w-full h-full max-w-none translate-x-0 translate-y-0 top-0 left-0 rounded-none border-none m-0 p-0'
          : viewMode === 'pip'
            ? 'bottom-4 right-4 w-64 h-96 rounded-xl border-2 border-primary/20 shadow-3xl translate-x-0 translate-y-0 top-auto left-auto'
            : // Standard Mode: True Full-screen on mobile, Centered Modal on Desktop
              'fixed inset-0 w-full h-full max-w-none translate-x-0 translate-y-0 top-0 left-0 rounded-none border-none md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[90vw] md:h-[90vh] md:max-w-7xl md:rounded-2xl md:border md:border-border',
      )}
    >
      {/* Backdrop for non-pip modes */}
      {viewMode !== 'pip' && (
        <div
          className="fixed inset-0 bg-black/60 -z-10 animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between border-b bg-background shrink-0',
          viewMode === 'pip' ? 'p-2' : 'p-4',
        )}
      >
        <div className="flex-1 min-w-0 pr-4">
          <h3
            className={cn(
              'font-bold truncate text-foreground',
              viewMode === 'pip' ? 'text-xs' : 'text-lg',
            )}
          >
            {title}
          </h3>
          {viewMode !== 'pip' && (
            <p className="text-xs text-muted-foreground">
              Previewing {fileType.toUpperCase()} file
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Action Group */}
          <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
            {/* Desktop Mode Toggle Logic */}
            <div className="hidden md:flex items-center gap-0.5">
              {/* Button 1: Decrease Size Toggle */}
              {viewMode !== 'pip' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setViewMode(viewMode === 'fullscreen' ? 'standard' : 'pip')}
                  title={viewMode === 'fullscreen' ? 'Return to Standard' : 'Minimize to PiP'}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              )}

              {/* Button 2: Increase Size Toggle */}
              {viewMode !== 'fullscreen' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setViewMode(viewMode === 'pip' ? 'standard' : 'fullscreen')}
                  title={viewMode === 'pip' ? 'Restore to Standard' : 'Fill Entire Screen'}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Mobile Mode Switcher (Simple Toggle) */}
            <div className="flex md:hidden items-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setViewMode(viewMode === 'pip' ? 'standard' : 'pip')}
                title={viewMode === 'pip' ? 'Restore' : 'Minimize to PiP'}
              >
                {viewMode === 'pip' ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="w-[1px] h-4 bg-border mx-1" />

          {/* Close */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive transition-colors"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-muted/20 relative min-h-0">
        {isPDF ? (
          <PdfViewer url={fileUrl} />
        ) : isImage ? (
          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              src={fileUrl}
              alt={title}
              className="max-w-full max-h-full object-contain drop-shadow-xl"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground italic p-4 text-center">
            Preview not available for this file type.
          </div>
        )}

        {/* Overlay click to restore from PiP */}
        {viewMode === 'pip' && (
          <div
            className="absolute inset-0 cursor-pointer z-10"
            onClick={() => setViewMode('standard')}
          />
        )}
      </div>
    </div>,
    document.body,
  )
}
