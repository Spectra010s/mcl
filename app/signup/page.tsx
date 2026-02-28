import type { Metadata } from 'next'
import { Suspense } from 'react'

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
export default function SignUpPage() {
  return (
    <>
      <script
        id="signup-schema"
        key="signup-page"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Suspense fallback={<div>Loading...</div>}>
        <SignUpContent />
      </Suspense>
    </>
  )
}
