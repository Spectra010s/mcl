'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogOut, Download, BookmarkPlus, Search } from 'lucide-react'
import { AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Resource {
  id: number
  title: string
  file_type: string
}

interface Download {
  id: number
  downloaded_at: string
  resources: Resource
}

interface Bookmark {
  id: number
  created_at: string
  resources: Resource
}

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  username: string
}

interface SettingsComponentsProps {
  initialSearches: string[]
  initialDownloads: Download[]
  initialBookmarks: Bookmark[]
  initialProfile: Profile
}
export default function SettingsComponents({
  initialSearches,
  initialDownloads,
  initialBookmarks,
  initialProfile,
}: SettingsComponentsProps) {
  const router = useRouter()
  const p: Profile = initialProfile
  const [fullName, setFullName] = useState(`${p.first_name || ''} ${p.last_name || ''}`.trim())
  const [username, setUsername] = useState(p.username || '')
  const [profileLoading, setProfileLoading] = useState(false)
  const [downloadHistory, setDownloadHistory] = useState<Download[]>(initialDownloads)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const [recentSearches, setRecentSearches] = useState<string[]>(initialSearches)

  const [activeTab, setActiveTab] = useState('profile')

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)

    try {
      const newProfile = { fullName, username }

      const response = await fetch(`/api/user/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile),
      })

      const uperror = await response.json()

      if (response.status === 400) throw new Error(uperror.error)

      toast.success('Success', { description: 'Profile updated successfully' })
    } catch (error: unknown) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to update profile',
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch(`/api/logout`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Logout failed:', error.message)
      }
    } catch (error: unknown) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Logout failed',
      })
    } finally {
      router.refresh()
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
      <p className="text-muted-foreground mb-8">Manage your account and preferences</p>

      {/* TAB NAVIGATION */}
      <div className="mt-4">
        <div className="flex border-b border-input overflow-x-auto">
          {['profile', 'downloads', 'bookmarks', 'searches', 'account'].map(tab => (
            <Button
              key={tab}
              variant="ghost"
              onClick={() => setActiveTab(tab)}
              className={`py-5 rounded-none text-sm font-semibold flex-shrink-0
          ${
            activeTab === tab
              ? 'border-b-2 border-primary text-primary hover:bg-transparent'
              : 'text-muted-foreground hover:bg-secondary/20'
          }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

        {/* TAB CONTENT CONTAINER */}
        <div className="space-y-6 pt-6">
          {/* Profile Tab Content */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={p.email || ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Adetayo Ade"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Spectra010s"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={profileLoading}>
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Downloads Tab Content */}
          {activeTab === 'downloads' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Download History
                </CardTitle>
                <CardDescription>Files you&apos;ve downloaded</CardDescription>
              </CardHeader>
              <CardContent>
                {downloadHistory.length === 0 ? (
                  <p className="text-muted-foreground">
                    No downloads yet. Start browsing and downloading files!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {downloadHistory.map(download => (
                      <div
                        key={download.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">{download.resources.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Downloaded on {format(new Date(download.downloaded_at), 'yyyy-MM-dd')}
                          </p>
                        </div>
                        <Link href={`/resource/${download.resources.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Bookmarks Tab Content */}
          {activeTab === 'bookmarks' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookmarkPlus className="w-5 h-5" />
                  Bookmarks
                </CardTitle>
                <CardDescription>Files you&apos;ve bookmarked</CardDescription>
              </CardHeader>
              <CardContent>
                {bookmarks.length === 0 ? (
                  <p className="text-muted-foreground">
                    No bookmarks yet. Add a file to your bookmarks!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {bookmarks.map(books => (
                      <div
                        key={books.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">{books.resources.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Added on {format(new Date(books.created_at), 'yyyy-MM-dd')}
                          </p>
                        </div>
                        <Link href={`/resource/${books.resources.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Searches Tab Content */}
          {activeTab === 'searches' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Recently Searched
                </CardTitle>
                <CardDescription>Your recent search queries</CardDescription>
              </CardHeader>
              <CardContent>
                {recentSearches.length === 0 ? (
                  <p className="text-muted-foreground">No recent searches</p>
                ) : (
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <Link key={index} href={`/search?q=${encodeURIComponent(search)}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start bg-transparent"
                        >
                          {search}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Account Tab Content */}
          {activeTab === 'account' && (
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Logging out will end your current session
                  </p>
                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
