'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Set up the worker
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`
}

interface PdfViewerProps {
  url: string
}

export default function PdfViewer({ url }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pdf, setPdf] = useState<pdfjs.PDFDocumentProxy | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [scale, setScale] = useState(1.5)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const renderTaskRef = useRef<pdfjs.RenderTask | null>(null)
  const isRenderingRef = useRef(false)

  const renderPage = useCallback(
    async (pageNum: number, currentPdf: pdfjs.PDFDocumentProxy, currentScale: number) => {
      const canvas = canvasRef.current
      if (!canvas || !currentPdf) return

      try {
        // Cancel any ongoing render task and WAIT for it
        if (renderTaskRef.current) {
          await renderTaskRef.current.cancel()
          renderTaskRef.current = null
        }

        // Simple lock to prevent overlapping render logic
        if (isRenderingRef.current) return
        isRenderingRef.current = true

        const page = await currentPdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: currentScale })
        const context = canvas.getContext('2d')

        if (!context) {
          isRenderingRef.current = false
          return
        }

        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        }

        const renderTask = page.render(renderContext)
        renderTaskRef.current = renderTask

        try {
          await renderTask.promise
        } catch (renderErr: any) {
          if (
            renderErr.name === 'RenderingCancelledException' ||
            renderErr.message?.includes('cancelled')
          ) {
            // Safe exit on cancellation
          } else {
            throw renderErr
          }
        } finally {
          renderTaskRef.current = null
        }
      } catch (err: any) {
        if (err.name === 'RenderingCancelledException') {
          // Handled above
        } else {
          console.error('Error rendering page:', err)
          setError('Failed to render page')
        }
      } finally {
        isRenderingRef.current = false
      }
    },
    [],
  )

  useEffect(() => {
    const loadPdf = async () => {
      setLoading(true)
      setError(null)
      try {
        const loadingTask = pdfjs.getDocument(url)
        const loadedPdf = await loadingTask.promise
        setPdf(loadedPdf)
        setNumPages(loadedPdf.numPages)
        setPageNumber(1)
        await renderPage(1, loadedPdf, scale)
      } catch (err: any) {
        console.error('Error loading PDF:', err)
        setError('Failed to load PDF. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadPdf()

    return () => {
      if (pdf) {
        pdf.destroy()
      }
    }
  }, [url, renderPage]) // Only reload when URL changes

  useEffect(() => {
    if (pdf) {
      renderPage(pageNumber, pdf, scale)
    }
  }, [pageNumber, scale, pdf, renderPage])

  const changePage = (offset: number) => {
    setPageNumber(prev => Math.min(Math.max(1, prev + offset), numPages))
  }

  const adjustZoom = (delta: number) => {
    setScale(prev => Math.min(Math.max(0.5, prev + delta), 3.0))
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <p className="text-destructive mb-4 font-medium">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-muted/10">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-background shrink-0 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1 || loading}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium min-w-[60px] text-center">
            {loading ? '...' : `Page ${pageNumber} of ${numPages}`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages || loading}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 border-l pl-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => adjustZoom(-0.25)}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-[10px] tabular-nums font-mono min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => adjustZoom(0.25)}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 flex justify-center items-start bg-muted/20 relative"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="shadow-lg bg-white max-w-full h-auto rounded-sm border mb-8"
        />
      </div>
    </div>
  )
}
