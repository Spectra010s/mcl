'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { User } from '@supabase/supabase-js'

interface HeaderProps {
  onMobileMenuToggle?: () => void
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [supabase])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setMobileSearchOpen(false)
    }
  }

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {!mobileSearchOpen && (
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Image
              src="/logo.svg"
              alt="My Campus Library Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="inline text-foreground">My Campus Library</span>
          </Link>
        )}

        {mobileSearchOpen && (
          <form onSubmit={handleSearch} className="flex-1 md:hidden">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>
          </form>
        )}

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-6 max-w-md">
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          </div>
        </form>

        <div className="hidden md:flex items-center gap-4">
          {!loading && !user && (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {!mobileSearchOpen ? (
            <>
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="p-2 hover:bg-muted rounded-lg"
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={onMobileMenuToggle}
                className="p-2 hover:bg-muted rounded-lg"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="p-2 hover:bg-muted rounded-lg"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
