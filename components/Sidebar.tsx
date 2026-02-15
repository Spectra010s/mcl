'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Plus,
  Settings,
  Github,
  FileText,
  Folder,
  HelpCircle,
  Shield,
  Bug,
} from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { FeedbackDialog } from '@/components/FeedbackDialog'

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

type UserRole = 'admin' | 'user'

interface DbUser {
  id: string
  role: UserRole
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const [user, setUser] = useState<DbUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const pathname = usePathname()
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (authUser) {
          const { data: userRole } = await supabase
            .from('users')
            .select('id, role')
            .eq('id', authUser.id)
            .single()

          setUser(userRole)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }
    getUser()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        onMobileClose
      ) {
        onMobileClose()
      }
    }

    if (mobileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [mobileOpen, onMobileClose])

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onMobileClose} />
      )}

      <aside
        ref={sidebarRef}
        className={`
          fixed md:relative
          top-0 right-0 bottom-0
          w-64 
          border-l border-border 
          bg-sidebar text-sidebar-foreground 
          overflow-y-auto
          z-50
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          md:flex md:flex-col
        `}
      >
        {/* If Not Logged In - Show Auth Options */}
        {!loading && !user && (
          <div className="p-4 border-b border-sidebar-border">
            <div className="space-y-2">
              <Link
                href={`/login?returnTo=${encodeURIComponent(pathname)}`}
                className="block"
                onClick={onMobileClose}
              >
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  Log In
                </Button>
              </Link>
              <Link
                href={`/signup?returnTo=${encodeURIComponent(pathname)}`}
                className="block"
                onClick={onMobileClose}
              >
                <Button
                  size="sm"
                  className="w-full justify-start bg-sidebar-primary hover:bg-sidebar-primary/90"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="flex-1 p-4 space-y-6">
          {/* Browse Section */}
          <div>
            {' '}
            <h3 className="text-sm font-semibold text-sidebar-foreground mb-3 flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Browse
            </h3>
            <div className="bg-sidebar-border border-t-2"></div>
            <div className="mt-3 space-y-2 pl-4">
              <Link
                href="/browse/faculties"
                className="text-sm text-sidebar-foreground/70 hover:text-sidebar-primary block"
                onClick={onMobileClose}
              >
                Faculties
              </Link>
            </div>
          </div>

          {/* Contribute Section */}
          <div>
            <h3 className="text-sm font-semibold text-sidebar-foreground mb-3 flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Contribute
            </h3>
            <div className="bg-sidebar-border border-t-2"></div>
            <div className="mt-3 space-y-2 pl-4">
              <Link
                href="/upload"
                className="text-sm text-sidebar-foreground/70 hover:text-sidebar-primary block"
                onClick={onMobileClose}
              >
                Add a PDF
              </Link>
              <Link
                href="/upload"
                className="text-sm text-sidebar-foreground/70 hover:text-sidebar-primary block"
                onClick={onMobileClose}
              >
                Add a Resource
              </Link>
            </div>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="text-sm font-semibold text-sidebar-foreground mb-3 flex items-center gap-1">
              <Folder className="w-4 h-4" />
              Resources
            </h3>
            <div className="bg-sidebar-border border-t-2"></div>
            <div className=" mt-3 space-y-2 pl-4">
              <Link
                href="/help"
                className="text-sm text-sidebar-foreground/70 hover:text-sidebar-primary flex items-center gap-2"
                onClick={onMobileClose}
              >
                <HelpCircle className="w-4 h-4" />
                Help & Support
              </Link>
              <Link
                href="https://github.com/Spectra010s/mcl"
                target="_blank"
                className="text-sm text-sidebar-foreground/70 hover:text-sidebar-primary flex items-center gap-2"
                onClick={onMobileClose}
              >
                <Github className="w-4 h-4" />
                Developer Center
              </Link>
              <Link
                href="/docs"
                className="text-sm text-sidebar-foreground/70 hover:text-sidebar-primary flex items-center gap-2"
                onClick={onMobileClose}
              >
                <FileText className="w-4 h-4" />
                Documentation
              </Link>
              <FeedbackDialog>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-normal text-sm text-sidebar-foreground/70 hover:text-sidebar-primary hover:bg-transparent flex items-center gap-2 w-full justify-start"
                  onClick={onMobileClose}
                >
                  <Bug className="w-4 h-4" />
                  Report an Issue
                </Button>
              </FeedbackDialog>
            </div>
          </div>
        </div>

        {user && (
          <div className="px-4 py-2">
            {/* Admin page for admins */}
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-2 text-sm text-sidebar-foreground hover:text-sidebar-primary pb-2"
                onClick={onMobileClose}
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            )}

            <hr className="border-sidebar-border border-t-2 mb-3" />

            {/* Settings - Only if Logged In */}

            <Link
              href="/settings"
              className="flex items-center gap-2 text-sm text-sidebar-foreground hover:text-sidebar-primary"
              onClick={onMobileClose}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
