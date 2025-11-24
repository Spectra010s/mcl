'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { Footer } from '@/components/Footer'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <div className="flex flex-1">
        <main className="flex-1">{children}</main>
        <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      </div>
      <Footer />
    </>
  )
}
