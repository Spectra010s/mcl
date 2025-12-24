import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { HelpCircle, Mail, BookOpen } from 'lucide-react'

export default function HelpPage() {
  const faqs = [
    {
      question: 'How do I create an account?',
      answer:
        `Click the 'Sign up' button on the homepage, enter your email, create a password, follow the email confirmation link sent to your inbox Or Sign up using either your Google account or your Github account.`,
    },
    {
      question: 'How do I search for resources?',
      answer:
        `Use the Search page from the sidebar or the search buttok from the header to search by title, author, or keyword. You can also browse resources by department and general courses using the Browse page, or filter on the main page.`,
    },
    {
      question: 'Can I download files or any Materials i need?',
      answer:
        `Yes! Once you're logged in and viewing a resource detail page, click the 'Download' button. Your download will be tracked in your Activity history for future reference.`,
    },
    {
      question: 'How do I add a resource to bookmarks?',
      answer:
        `On any resource detail page, click the bookmark icon to add it to your bookmarks. You can view all your bookamrks from the Settings page in the sidebar.`,
    },
    {
      question: 'Can I upload my own resources?',
      answer:
        `Yes, every student and user of My Campus Libraryand authorized staff can upload resources using the Upload page. Submissions are reviewed for quality and appropriateness before being made available to the community.`,
    },
    {
      question: 'What are the View count for?',
      answer:
        `The view count shows the amount of time a resource has been viewed, you can use this to know which of the files are popular to all users.`,
    },
    {
      question: 'Is my data secure?',
      answer:
        'Yes, we use industry-standard encryption and security practices. Your personal information is protected by Row Level Security policies that ensure only you can access your data.',
    },
    {
      question: 'How do I change my profile information?',
      answer:
        "Go to your Settings page from the sidebar and you will be in the Profile tab, then you can update your name and other personal information.",
    },
    {
      question: 'What formats are supported for uploaded files?',
      answer:
        'We support PDF, DOCX, XLSX, PPTX, MP4, and other common academic formats. For security reasons, executable files are not permitted.',
    },
  ]

  return (
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
                <a className="underline" href="mailto:spectra010s@gmail.com">spectra010s@gmail.com</a></p>
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
  )
}
