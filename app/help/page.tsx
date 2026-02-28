import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { HelpCircle, Mail, BookOpen } from 'lucide-react'
import { FAQData } from '@/data/faq'
import { createSchema, generateBreadcrumbSchema } from '@/lib/schema'
import { faqNode } from '@/schemas/faq'
import { baseUrl } from '@/constants'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help & Support',
  description:
    'Find answers to frequently asked questions about downloading resources, contributing materials, and managing your account.',
}

const breadcrumbNode = generateBreadcrumbSchema([
  {
    name: 'Help & Support',
    url: `${baseUrl}/help`,
  },
])

const jsonLd = createSchema([faqNode, breadcrumbNode])

const faqs = FAQData

export default function HelpPage() {
  return (
    <>
      <script
        id="help-page-schema"
        key="help-page"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
              <HelpCircle size={32} />
              Help & Support
            </h1>
            <p className="text-lg text-white/90">
              Find answers to common questions about My Campus Library
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto py-12 px-6">
          {/* FAQ */}
          <h2 className="text-2xl font-bold text-primary mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4 mb-12">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-primary/20 hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl">Still need help?</CardTitle>
              <CardDescription>Contact our support team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-primary">Email Support</h4>
                  <p className="text-muted-foreground">
                    <a className="underline" href="mailto:spectra010s@gmail.com">
                      spectra010s@gmail.com
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We typically respond within 24 hours
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <BookOpen className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-primary">Documentation</h4>
                  <p className="text-muted-foreground">Check our user guide and tutorials</p>
                  <Link href="/doc">
                    <Button variant="link" className="text-primary p-0 h-auto mt-1">
                      View Documentation →
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
