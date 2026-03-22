'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type SearchQueryContextValue = {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

const SearchQueryContext = createContext<SearchQueryContextValue | null>(null)

function getQueryFromLocation() {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get('q') || ''
}

export function SearchQueryProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState(getQueryFromLocation)

  useEffect(() => {
    const handlePopState = () => {
      setSearchQuery(getQueryFromLocation())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <SearchQueryContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchQueryContext.Provider>
  )
}

export function useSearchQueryContext() {
  const context = useContext(SearchQueryContext)

  if (!context) {
    throw new Error('useSearchQueryContext must be used within SearchQueryProvider')
  }

  return context
}
