'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, FileText, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { format } from 'date-fns'

interface Resource {
  id: number
  title: string
  file_type: string
  download_count: number
  upload_date: string
}

interface ResourceCarouselProps {
  title: string
  resources: Resource[]
}

export function ResourceCarousel({ title, resources }: ResourceCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />
      case 'document':
        return <FileText className="w-6 h-6 text-blue-500" />
      case 'presentation':
        return <FileText className="w-6 h-6 text-orange-500" />
      case 'video':
        return <FileText className="w-6 h-6 text-purple-500" />
      case 'audio':
        return <FileText className="w-6 h-6 text-pink-500" />
      default:
        return <File className="w-6 h-6 text-gray-500" />
    }
  }

  const getFileTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      pdf: 'PDF',
      document: 'Document',
      presentation: 'Presentation',
      video: 'Video',
      audio: 'Audio',
      image: 'Image',
      text: 'Text File',
      other: 'Other',
    }
    return labels[type] || 'File'
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320 // Card width + gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  if (resources.length === 0) {
    return null
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-foreground">{title}</h3>
        <span className="text-sm text-muted-foreground">
          {resources.length} file{resources.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          {resources.map(resource => (
            <Link
              key={resource.id}
              href={`/resource/${resource.id}`}
              className="flex-shrink-0 w-52"
            >
              <Card className="h-full hover:shadow-lg hover:border-primary transition-all cursor-pointer overflow-hidden">
                <div className="px-3 flex flex-col h-full">
                  {/* File Icon & Type */}
                  <div className="flex items-center gap-3 mb-3">
                    {getFileIcon(resource.file_type)}
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                      {getFileTypeLabel(resource.file_type)}
                    </span>
                  </div>

                  {/* Resource Title */}
                  <h4 className="font-semibold text-foreground mb-2 line-clamp-2 flex-1">
                    {resource.title}
                  </h4>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>
                      {resource.download_count} download{resource.download_count !== 1 ? 's' : ''}
                    </span>
                    <span>{format(new Date(resource.upload_date), 'yyyy-MM-dd')}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {resources.length > 3 && (
          <>
            <Button
              size="icon"
              variant="outline"
              aria-label="scroll left"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background border-border"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="scroll right"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background border-border"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
