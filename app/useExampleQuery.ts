import { useQuery } from '@tanstack/react-query'

interface Post {
  id: number
  title: string
  body: string
}

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5')
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
}

export function useExampleQuery() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })
}
