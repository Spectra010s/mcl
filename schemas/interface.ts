// ImageObjectType
interface ImageObject {
  '@type': 'ImageObject'
  url: string
  width?: string | number
  height?: string | number
}

// WebSiteNode
export interface WebSiteNode {
  '@type': 'WebSite'
  '@id': string
  name: string
  alternateName?: string
  url: string
  image: string
  publisher: {
    '@id': string
    name: string
    logo: ImageObject
  }
  creator?: {
    '@type': 'Person'
    name: string
    alternateName?: string
    url: string
    image?: string
    sameAs?: string[]
    jobTitle?: string
    worksFor?: {
      '@type': 'Organization'
      name: string
    }
  }
  potentialAction: {
    '@type': 'SearchAction'
    target: {
      '@type': 'EntryPoint'
      urlTemplate: string
    }
    'query-input': string
  }
}

// OrganizationNode
export interface OrganizationNode {
  '@type': 'EducationalOrganization'
  '@id': string
  name: string
  description: string
  alternateName?: string
  url: string
  logo: ImageObject
  email: string
  sameAs?: string[]
  contactPoint: {
    '@type': 'ContactPoint'
    email: string
    contactType: string
  }
  address?: {
    '@type': 'PostalAddress'
    addressLocality?: string
    addressRegion?: string
    addressCountry: string
    postalCode: string
    streetAdrress: string
  }
  foundingLocation?: {
    '@type': 'Place'
    name: string
  }
  parentOrganization?: {
    '@type': 'Organization'
    name: string
  }
}

// BreadcrumbListNode
export interface BreadcrumbListNode {
  '@type': 'BreadcrumbList'
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    name: string
    item: string
  }>
}

// FAQPageNode
export interface FAQPageNode {
  '@type': 'FAQPage'
  mainEntity: Array<{
    '@type': 'Question'
    name: string
    acceptedAnswer: {
      '@type': 'Answer'
      text: string
    }
  }>
}

export type GraphNode = WebSiteNode | OrganizationNode | BreadcrumbListNode | FAQPageNode

export interface MclSchema {
  '@context': 'https://schema.org'
  '@graph': GraphNode[]
}
