import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mycampuslib.vercel.app'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/auth/', '/settings/', '/upload/', '/search/', '/~offline/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
