import type { MclSchema, GraphNode, BreadcrumbListNode } from '@/schemas/interface'
import { baseUrl } from '@/constants'

export const createSchema = (nodes: GraphNode[]): MclSchema => ({
  '@context': 'https://schema.org',
  '@graph': nodes,
})

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
): BreadcrumbListNode {
  const allItems = [{ name: 'Home', url: baseUrl }, ...items]

  return {
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
