'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogOut, Download, BookmarkPlus, Search } from 'lucide-react'
import { AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [downloadHistory, setDownloadHistory] = useState<any[]>([])
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/login')
        return
      }

      setUser(authUser)

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (!error && profile) {
        setUserData(profile)
        setFullName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim())
        setUsername(profile.username || '')
      }

      const { data: downloads } = await supabase
        .from('download_history')
        .select('*, resources(id, title, file_type)')
        .eq('user_id', authUser.id)
        .order('downloaded_at', { ascending: false })
        .limit(20)

      if (downloads) {
        setDownloadHistory(downloads)
      }

      const { data: bookmark } = await supabase
        .from('user_bookmarks')
        .select('*, resources(id, title, file_type)')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })

      if (bookmark) {
        setBookmarks(bookmark)
      }

      const { data: searches } = await supabase
        .from('search_history')
        .select('query, searched_at')
        .eq('user_id', authUser.id)
        .order('searched_at', { ascending: false })
        .limit(10)

      if (searches) {
        setRecentSearches(searches.map(s => s.query))
      }

      setHistoryLoading(false)
      setLoading(false)
    }

    checkAuth()
  }, [supabase, router])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setMessage(null)

    try {
      const [firstName, ...lastNameParts] = fullName.trim().split(' ')
      const { error } = await supabase
        .from('users')
        .update({
          first_name: firstName,
          last_name: lastNameParts.join(' '),
          username,
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (error: unknown) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update profile',
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
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
                        value={user?.email || ''}
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
                        placeholder="John Doe"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="johndoe"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  {message && (
                    <div
                      className={`p-3 rounded-lg flex gap-2 ${message.type === 'success' ? 'bg-green-50' : 'bg-red-50'}`}
                    >
                      <AlertCircle
                        className={`w-5 h-5 flex-shrink-0 ${
                          message.type === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}
                      />
                      <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                        {message.text}
                      </p>
                    </div>
                  )}

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
                <CardDescription>Files you've downloaded</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <p>Loading...</p>
                ) : downloadHistory.length === 0 ? (
                  <p className="text-muted-foreground">
                    No downloads yet. Start browsing and downloading files!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {downloadHistory.map(download => (
                      <div
                        key={download.id}
                        className="flex items-between justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">{download.resources?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Downloaded on {new Date(download.downloaded_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Link href={`/resource/${download.resources?.id}`}>
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
                <CardDescription>Files you've bookmarked</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <p>Loading...</p>
                ) : bookmarks.length === 0 ? (
                  <p className="text-muted-foreground">
                    No bookmarks yet. Add a file to your bookmarks!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {bookmarks.map(books => (
                      <div
                        key={books.id}
                        className="flex items-between justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">{books.resources?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Added on {new Date(books.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Link href={`/resource/${books.resources?.id}`}>
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
