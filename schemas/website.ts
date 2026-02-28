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
    name: 'Spectra010s under Hiverra',
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/spectra010s.jpg`,
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
