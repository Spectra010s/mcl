import { MetadataRoute } from 'next'
import { baseUrl } from '@/constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/auth/', '/settings/', '/upload/', '/search/', '/~offline/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
