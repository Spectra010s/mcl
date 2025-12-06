import type { Metadata } from 'next'
import { Suspense } from 'react'
import SearchClient from './client'

type PageProps = {
  searchParams: Promise<{
    q?: string | string[]
    [key: string]: string | string[] | undefined
  }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const searchParams = await props.searchParams

  const queryParam = searchParams.q

  const query = Array.isArray(queryParam) ? queryParam[0] : queryParam || ''

  return {
    title: query ? `Search: ${query} - My Campus Library` : 'Search Resources - My Campus Library',
    description: query
      ? `Search results for "${query}" in My Campus Library`
      : 'Search across thousands of academic resources, study materials, and lecture notes.',
  }
}

export default async function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
      <SearchClient />
    </Suspense>
  )
}
