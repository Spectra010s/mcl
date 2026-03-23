import { createSchema, generateBreadcrumbSchema } from '@/lib/schema'
import { baseUrl } from '@/constants'
import type { Metadata } from 'next'
import UploadClient, { RestoreData } from './client'

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

type PageProps = {
  searchParams?: Promise<{
    title?: string | string[]
    description?: string | string[]
    facultyId?: string | string[]
    departmentId?: string | string[]
    levelId?: string | string[]
    courseId?: string | string[]
    fileName?: string | string[]
  }>
}

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] || '' : value || ''
}

export default async function UploadPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  const initialRestoreData: RestoreData = {
    title: getParamValue(resolvedSearchParams?.title),
    description: getParamValue(resolvedSearchParams?.description),
    facultyId: getParamValue(resolvedSearchParams?.facultyId),
    departmentId: getParamValue(resolvedSearchParams?.departmentId),
    levelId: getParamValue(resolvedSearchParams?.levelId),
    courseId: getParamValue(resolvedSearchParams?.courseId),
  }

  const restoredFileName = getParamValue(resolvedSearchParams?.fileName)

  return (
    <>
      <script
        id="upload-page-schema"
        key="upload-page"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <UploadClient initialRestoreData={initialRestoreData} restoredFileName={restoredFileName} />
    </>
  )
}
