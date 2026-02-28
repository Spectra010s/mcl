import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { LayoutContent } from '@/components/LayoutContent'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { SerwistProvider } from './lib/client'
import WatchupProviderWrapper from '@/components/WatchUpWrapper'

import { website } from '@/schemas/website'
import { organization } from '@/schemas/organization'
import { createSchema } from '@/lib/schema'
import { mclName } from '@/constants'

const globalSchema = createSchema([website, organization])

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const DEFAULT_TITLE = `${mclName} - Your Academic Resource Hub`
const DEFAULT_DESC =
  'Empowering knowledge for every student — your library for study materials, past questions, and academic resources for effective learning.'

const TITLE_TEMPLATE = `%s - ${mclName}`

export const metadata: Metadata = {
  applicationName: mclName,
  title: {
    default: DEFAULT_TITLE,
    template: TITLE_TEMPLATE,
  },
  description: DEFAULT_DESC,
  openGraph: {
    title: {
      default: DEFAULT_TITLE,
      template: TITLE_TEMPLATE,
    },
    description: DEFAULT_DESC,
    siteName: DEFAULT_TITLE,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: DEFAULT_TITLE,
      template: TITLE_TEMPLATE,
    },
    description: DEFAULT_DESC,
    creator: '@mcl',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#182b5c',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          key="global-ldjson"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSchema) }}
        />
        <meta
          name="google-site-verification"
          content="Q24M4X9zoQ0B3kNG3W7ekoB2-3_2fJi8_vNH2W7dTNU"
        />
        <meta name="msvalidate.01" content="E8636E77457C3ED17C9AADD9084197F3" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {' '}
        <WatchupProviderWrapper
          projectId="aba266cb-dabf-4fd2-a53f-1633352a8786"
          apiKey="aba266cb-dabf-4fd2-a53f-1633352a8786"
          baseUrl="https://mycampuslib.vercel.app"
        >
          <SerwistProvider swUrl="/serwist/sw.js">
            <LayoutContent>{children}</LayoutContent>
          </SerwistProvider>
        </WatchupProviderWrapper>
        <Toaster position="top-center" theme="light" />
        <Analytics />
      </body>
    </html>
  )
}
