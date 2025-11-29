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
      try {
        // Search across multiple fields: title, description, course_code, keywords
        // this search will be heavily worked on, mvp first
        // The query is consolidated and uses a PostgreSQL function to simplify the search and prevent duplicates in the client.
        const { data, error } = await supabase
          .rpc('search_resources_and_keywords', {
            search_term: query,
          })
          .select(
            `
            id,
            title,
            description,
            file_type,
            file_size_bytes,
            view_count,
            download_count,
            bookmark_count,
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
          `,
          )
          .eq('is_approved', true)
          .order('view_count', { ascending: false })
          .limit(50)

        if (error) throw error

        setResults(data || [])
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
              <Card key={r.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Link href={`/resource/${r.id}`}>
                      <h3 className="font-semibold text-foreground text-lg hover:text-primary">
                        {r.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {r.description}
                      </p>

                      {/* Course Info */}
                      {r.courses && (
                        <div className="mt-3 text-sm">
                          <span className="text-muted-foreground">
                            {r.courses.course_code}: {r.courses.course_title}
                          </span>
                          <span className="text-muted-foreground mx-2">•</span>
                          <span className="text-muted-foreground">
                            {r.courses.academic_levels?.level_number} Level
                          </span>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
                        <span>{r.file_type?.toUpperCase() || 'FILE'}</span>
                        <span>{(r.file_size_bytes / 1024 / 1024).toFixed(2)} MB</span>

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
                    </Link>
                  </div>

                  <div className="flex flex-col gap-2 items-start">
                    {user ? (
                      <>
                        <Button size="sm" variant="ghost" className="flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                        <Button size="sm" variant="ghost" className="flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          Favorite
                        </Button>
                        <Button size="sm" variant="ghost" className="flex items-center gap-2">
                          <BookmarkPlus className="w-4 h-4" />
                          Bookmark
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
