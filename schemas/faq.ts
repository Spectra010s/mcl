import type { FAQItem } from '@/data/faq'
import { FAQData } from '@/data/faq'
import type { FAQPageNode } from './interface'

export const faqNode: FAQPageNode = {
  '@type': 'FAQPage',
  mainEntity: FAQData.map(faqItem => ({
    '@type': 'Question',
    name: faqItem.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faqItem.answer,
    },
  })),
}
