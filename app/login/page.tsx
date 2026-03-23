import type { Metadata } from 'next'
import LoginContent from './client'
import { generateBreadcrumbSchema, createSchema } from '@/lib/schema'
import { baseUrl } from '@/constants'

const breadcrumbNode = generateBreadcrumbSchema([
  {
    name: 'Login',
    url: `${baseUrl}/login`,
  },
])
const jsonLd = createSchema([breadcrumbNode])

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Access your account to download past questions and manage your uploads.',
}

type PageProps = {
  searchParams?: Promise<{
    returnTo?: string | string[]
  }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const returnToParam = resolvedSearchParams?.returnTo
  const returnTo = Array.isArray(returnToParam) ? returnToParam[0] : returnToParam

  return (
    <>
      <script
        id="login-schema"
        key="login-page"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LoginContent returnTo={returnTo || '/browse/faculties'} />
    </>
  )
}
