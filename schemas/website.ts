import { WebSiteNode } from './interface'
import { baseUrl, mclName } from '@/constants'

export const website: WebSiteNode = {
  '@type': 'WebSite',
  '@id': `${baseUrl}/#website`,
  name: mclName,
  alternateName: 'MCL',
  url: baseUrl,
  image: `${baseUrl}/logo.svg`,
  publisher: {
    '@id': `${baseUrl}/#organization`,
    name: mclName,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/logo.svg`,
    },
  },

  creator: {
    '@type': 'Person',
    name: 'Adeloye Adetayo',
    alternateName: 'Spectra010s',
    url: 'https://spectra010s.vercel.app',
    image: `${baseUrl}/spectra010s.jpg`,
    sameAs: [
      'https://x.com/spectra010s',
      'https://github.com/Spectra010s',
      'mailto:spectra010s@gmail.com',
      'https://www.linkedin.com/in/adeloye-adetayo-273723253',
      'https://tiktok.com/Spectra010s',
      'https://t.me/Spectra010s',
    ],
    jobTitle: 'Lead Developer',
    worksFor: {
      '@type': 'Organization',
      name: 'Hiverra',
    },
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${baseUrl}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}
