import type { Metadata } from 'next'
import SignUpContent from './client'

import { generateBreadcrumbSchema, createSchema } from '@/lib/schema'
import { baseUrl } from '@/constants'

const breadcrumbNode = generateBreadcrumbSchema([
  {
    name: 'Create Account',
    url: `${baseUrl}/signup`,
  },
])

const jsonLd = createSchema([breadcrumbNode])

export const metadata: Metadata = {
  title: 'Create Account',
  description:
    'Join the community to start contributing and accessing academic materials for your courses.',
}

type PageProps = {
  searchParams?: Promise<{
    returnTo?: string | string[]
  }>
}

export default async function SignUpPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const returnToParam = resolvedSearchParams?.returnTo
  const returnTo = Array.isArray(returnToParam) ? returnToParam[0] : returnToParam

  return (
    <>
      <script
        id="signup-schema"
        key="signup-page"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SignUpContent returnTo={returnTo || '/browse/faculties'} />
    </>
  )
}
