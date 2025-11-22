import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV !== 'production'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: isDev,
  },
  images: {
    unoptimized: isDev,
  },
}

export default nextConfig
