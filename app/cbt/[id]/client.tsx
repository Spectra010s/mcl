'use client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function Cbtcl() {
  const router = useRouter()

  return (
    <main className="flex-1 max-w-4xl mx-auto px-4 py-12 md:px-6">
      <div className="text-center">
        <p className="text-muted-foreground mb-6">cbt functionality coming soon!</p>
        <Button onClick={() => router.back()}>Go back</Button>
      </div>
    </main>
  )
}
