'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Heart, Download, BookmarkPlus, Search, Eye } from 'lucide-react'

export default function SearchClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(!!query)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  useEffect(() => {
    if (!query) {
      setResults([])
      setLoading(false)
      return
    }

    if (query !== searchQuery) {
      setSearchQuery(query)
    }

    const performSearch = async () => {
      setLoading(true)
      let finalResults = []

      try {
        // Search across multiple fields: title, description, course_code, keywords
        // this search will be heavily worked on, mvp first
        // The query is consolidated and uses a PostgreSQL function to simplify the search and prevent duplicates in the client.

        // for the search record history
        if (user) {
          await fetch('/api/search/record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
          })
        }

        const userId = user?.id

        const ResourceQuery = `
    id,
    title,
    description,
    file_type,
    file_size_bytes,
    view_count,
    download_count,
    bookmark_count,
    user_bookmarks(user_id),
    courses(
        id,
        course_code,
        course_title,
        academic_levels(
            level_number,
            departments(
                id,
                full_name,
                faculty_id
            )
        )
    ),
    resource_keywords(keyword)
`

        // --- PRIMARY SEARCH ATTEMPT: FTS ---

        let { data, error } = await supabase
          .rpc('search_resources_fts', { search_term: query })
          .select(ResourceQuery)
          .limit(50)

        if (error) throw error

        finalResults = data || []
        let isFuzzyFallback = false

        // --- SECONDARY SEARCH ATTEMPT: Fuzzy ---
        if (finalResults.length === 0) {
          const fuzzyResponse = await supabase
            .rpc('search_resources_keywords_fuzzy', { search_term: query })
            .select(ResourceQuery)
            .limit(50)

          if (fuzzyResponse.error) throw fuzzyResponse.error

          finalResults = fuzzyResponse.data || []
          isFuzzyFallback = true
        }

        const processedResults = finalResults.map(resource => {
          const isBookmarked =
            !!userId && !!resource.user_bookmarks && resource.user_bookmarks.length > 0

          return {
            ...resource,
            isBookmarked: isBookmarked,
            user_bookmarks: undefined,
          }
        })

        setResults(processedResults)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleDownload = (resourceId: number) => {
    if (!user) {
      router.push('/login?message=Login to download the file')
      return
    }

    setActionLoading(resourceId.toString())

    const form = document.createElement('form')
    form.method = 'POST'
    form.action = `/api/resources/${resourceId}/download`
    form.style.display = 'none'
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)

    setTimeout(() => setActionLoading(null), 2000)
  }

  const handleBookmark = async (resourceId: number) => {
    if (!user) {
      router.push('/login?message=Login to bookmark')
      return
    }

    setActionLoading(resourceId.toString())

    try {
      const response = await fetch(`/api/resources/${resourceId}/bookmark`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Bookmark failed')

      const data = await response.json()
      const newStatus = data.bookmarked

      setResults(prevResults =>
        prevResults.map(r =>
          r.id === resourceId
            ? {
                ...r,
                isBookmarked: newStatus,
                bookmark_count: r.bookmark_count + (newStatus ? 1 : -1),
              }
            : r,
        ),
      )
    } catch (error) {
      console.error('Bookmark error:', error)
      alert('Failed to bookmark.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 py-12 md:px-6">
      {/* Search Box */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-6">Search Resources</h1>
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by pdf name, filename, or course code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 text-lg"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          </div>
          <Button aria-label="Search" type="submit" className="mt-4">
            Search
          </Button>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Searching...</p>
        </div>
      ) : query ? (
        <>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {results.length} Result{results.length !== 1 ? 's' : ''} for "{query}"
          </h2>

          <div className="space-y-4">
            {results.map(r => (
              <Card key={r.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link href={`/resource/${r.id}`}>
                      <h3 className="font-semibold text-foreground text-lg hover:text-primary">
                        {r.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {r.description}
                      </p>
                    </Link>
                  </div>

                  <div className="flex flex-col gap-2 items-start">
                    {user ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex items-center gap-2"
                          onClick={() => handleDownload(r.id)}
                          disabled={actionLoading === r.id.toString()}
                        >
                          <Download className="w-4 h-4" />
                          {actionLoading === r.id.toString() ? '...' : 'Download'}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className={`flex items-center gap-2 ${r.isBookmarked ? 'text-blue-600' : ''}`}
                          onClick={() => handleBookmark(r.id)}
                          disabled={actionLoading === r.id.toString()}
                        >
                          <BookmarkPlus
                            className={`w-4 h-4 ${r.isBookmarked ? 'fill-current text-blue-600' : ''}`}
                          />
                          {actionLoading === r.id.toString()
                            ? '...'
                            : r.isBookmarked
                              ? 'Bookmarked'
                              : 'Bookmark'}
                        </Button>
                      </>
                    ) : (
                      <Link href="/login">
                        <Button size="sm" className="w-full">
                          Login to access
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
                <div>
                  {r.courses && (
                    <div
                      className="
                        text-sm"
                    >
                      <span className="text-muted-foreground">
                        {r.courses.course_code}: {r.courses.course_title}
                      </span>
                      <span className="text-muted-foreground mx-2">•</span>
                      <span className="text-muted-foreground">
                        {r.courses.academic_levels?.level_number} Level
                      </span>
                    </div>
                  )}
                </div>
                <div className="border border-t-1"></div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="text-primary">{r.file_type?.toUpperCase() || 'FILE'}</span>

                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {r.view_count || 0} views
                  </span>

                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {r.download_count || 0} download{r.download_count !== 1 ? 's' : ''}
                  </span>

                  <span className="flex items-center gap-1">
                    <BookmarkPlus className="w-3 h-3" />
                    {r.bookmark_count || 0} bookmark{r.bookmark_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {results.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No resources found. Try a different search.</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Enter a pdf name, make a search to get started</p>
        </div>
      )}
    </main>
  )
}
