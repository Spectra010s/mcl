import { createSchema, generateBreadcrumbSchema } from '@/lib/schema'
import { baseUrl } from '@/constants'
import type { Metadata } from 'next'
import UploadClient from './client'

export const metadata: Metadata = {
  title: 'Share Study Materials, Notes & Past Questions',
  description:
    'Contribute to the MCL community by sharing your study materials, lecture notes, and past questions. Help your fellow students and build the knowledge library.',
}

const breadcrumbNode = generateBreadcrumbSchema([
  {
    name: 'Upload Resource',
    url: `${baseUrl}/upload`,
  },
])

const jsonLd = createSchema([breadcrumbNode])

export default function UploadPage() {
  return (
    <>
      <script
        id="upload-page-schema"
        key="upload-page"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <UploadClient />
    </>
  )
}
