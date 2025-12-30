import { createSerwistRoute } from '@serwist/turbopack'

// Using `VERCEL_GIT_COMMIT_SHA` as it provides it at build time and runtime

const revision = process.env.VERCEL_GIT_COMMIT_SHA || crypto.randomUUID()

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute(
  {
    additionalPrecacheEntries: [{ url: '/~offline', revision }],
    swSrc: 'app/sw.ts',
    // Copy relevant Next.js configuration (assetPrefix,
    // basePath, distDir) over if you've changed them.
    nextConfig: {},
  },
)
