import { OrganizationNode } from './interface'
import { baseUrl, mclName } from '@/constants'

export const organization: OrganizationNode = {
  '@type': 'EducationalOrganization',
  '@id': `${baseUrl}/#organization`,
  name: mclName,
  alternateName: 'MCL',
  description:
    'Empowering knowledge for every student — your library for study materials, past questions, and academic resources.',
  url: baseUrl,
  logo: {
    '@type': 'ImageObject',
    url: `${baseUrl}/logo.svg`,
    width: 512,
    height: 512,
  },
  email: 'spectra010s@gmail.com',
  foundingLocation: {
    '@type': 'Place',
    name: 'Federal University Oye-Ekiti',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Ikole-Ekiti',
    addressRegion: 'Ekiti',
    addressCountry: 'NG',
    postalCode: '370231',
    streetAddress: 'Ilotin, Aloke St.',
  },
  sameAs: ['https://github.com/Spectra010s/mcl'],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'spectra010s@gmail.com',
    contactType: 'Administrative Support',
  },
}
