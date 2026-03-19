'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, BookmarkPlus, Search, Eye } from 'lucide-react'
import { toast } from 'sonner'
import * as searchApi from '@/lib/api/search'
import { useUser } from '@/hooks/useUser'

type InputEvent = React.ChangeEvent<HTMLInputElement>

export default function SearchClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(query)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [bookmarkingId, setBookmarkingId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { user } = useUser()

  useEffect(() => {
    setSearchQuery(query)
  }, [query])

  const { data: results = [], isLoading: isSearching } = useQuery<searchApi.Resource[]>({
    queryKey: ['search', query, user?.id],
    enabled: !!query,
    queryFn: async () => {
      if (user) {
        await searchApi.recordSearchQuery(query)
      }

      return searchApi.searchResources(query, user ?? null)
    },
  })

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

    setDownloadingId(resourceId.toString())

    const form = document.createElement('form')
    form.method = 'POST'
    form.action = `/api/resources/${resourceId}/download`
    form.style.display = 'none'
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)

    setTimeout(() => setDownloadingId(null), 2000)
  }

  const bookmarkMutation = useMutation({
    mutationFn: searchApi.toggleBookmark,
    onMutate: async (resourceId: number) => {
      setBookmarkingId(resourceId.toString())
      const activeQuery = query
      const activeUserId = user?.id
      const queryKey = ['search', activeQuery, activeUserId]

      await queryClient.cancelQueries({ queryKey })
      const previousResults = queryClient.getQueryData<searchApi.Resource[]>(queryKey)

      queryClient.setQueryData<searchApi.Resource[]>(queryKey, oldResults =>
        (oldResults || []).map(r =>
          r.id === resourceId
            ? {
                ...r,
                isBookmarked: !r.isBookmarked,
                bookmark_count: r.bookmark_count + (r.isBookmarked ? -1 : 1),
              }
            : r,
        ),
      )

      return { previousResults, activeQuery, activeUserId }
    },
    onError: (_error, _resourceId, context) => {
      if (context?.previousResults) {
        queryClient.setQueryData(
          ['search', context.activeQuery, context.activeUserId],
          context.previousResults,
        )
      }
      toast.error('Failed to bookmark.')
    },
    onSuccess: (data: { bookmarked: boolean }, resourceId, context) => {
      const newStatus = data.bookmarked
      queryClient.setQueryData<searchApi.Resource[]>(
        ['search', context.activeQuery, context.activeUserId],
        oldResults =>
          (oldResults || []).map(r =>
            r.id === resourceId
              ? {
                  ...r,
                  isBookmarked: newStatus,
                  bookmark_count: r.bookmark_count + (newStatus ? 1 : -1),
                }
              : r,
          ),
      )
    },
    onSettled: () => {
      setBookmarkingId(null)
    },
  })

  const handleBookmark = (resourceId: number) => {
    if (!user) {
      router.push('/login?message=Login to bookmark')
      return
    }

    bookmarkMutation.mutate(resourceId)
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
              onChange={(e: InputEvent) => setSearchQuery(e.target.value)}
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
      {isSearching ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Searching...</p>
        </div>
      ) : query ? (
        <>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {results.length} Result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
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
                          disabled={downloadingId === r.id.toString()}
                        >
                          <Download className="w-4 h-4" />
                          {downloadingId === r.id.toString() ? 'Downloading...' : 'Download'}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className={`flex items-center gap-2 ${r.isBookmarked ? 'text-blue-600' : ''}`}
                          onClick={() => handleBookmark(r.id)}
                          disabled={bookmarkingId === r.id.toString()}
                        >
                          <BookmarkPlus
                            className={`w-4 h-4 ${r.isBookmarked ? 'fill-current text-blue-600' : ''}`}
                          />
                          {bookmarkingId === r.id.toString()
                            ? 'Bookmarking...'
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
                  {r.courses && r.courses.length > 0 && (
                    <div className="text-sm">
                      {r.courses.map(course => (
                        <span key={course.id} className="text-muted-foreground">
                          {course.course_code}: {course.course_title}
                          <span className="mx-2">•</span>
                          {course.academic_levels?.map(level => (
                            <span key={level.level_number}>{level.level_number} Level</span>
                          ))}
                        </span>
                      ))}
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
