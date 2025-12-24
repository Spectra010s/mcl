import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { LayoutContent } from '@/components/LayoutContent'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'My Campus Library',
  description:
    'Empowering knowledge for every student — your library for study materials, past questions, and academic resources for effective learning.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="Q24M4X9zoQ0B3kNG3W7ekoB2-3_2fJi8_vNH2W7dTNU"
        />
        <meta name="msvalidate.01" content="E8636E77457C3ED17C9AADD9084197F3" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {' '}
        <LayoutContent>{children}</LayoutContent>
        <Toaster position="top-center" theme="light" />
        <Analytics />
      </body>
    </html>
  )
}
