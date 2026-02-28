import type { Metadata } from 'next'
import { Suspense } from 'react'
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

export default function LoginPage() {
  return (
    <>
      <script
        id="login-schema"
        key="login-page"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Suspense fallback={<div>Loading...</div>}>
        <LoginContent />
      </Suspense>
    </>
  )
}
