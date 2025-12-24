import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
  
      <div className="max-w-7xl mx-auto px-4 py-16 md:px-6">
        {/* Hero Section */}
        <section className="text-center mb-20">
         <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Your Academic Resource Hub
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Access thousands of study materials, lecture notes, and resources from across all
            faculties and departments.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/browse/faculties">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Browse Library
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline">
                Contribute
              </Button>
            </Link>
          </div>
        </section>

        {/* Quick Access Section */}
        <section className="grid md:grid-cols-3 gap-6 mb-20">
          <div className="border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors">
            <h3 className="font-semibold text-lg mb-2">Browse Library</h3>
            <p className="text-muted-foreground mb-4">Find resources sorted by area of study</p>
            <Link href="/browse/faculties" className="text-primary hover:underline">
              Start browsing →
            </Link>
          </div>
          <div className="border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors">
            <h3 className="font-semibold text-lg mb-2">Search Resources</h3>
            <p className="text-muted-foreground mb-4">
              Find materials by course title, course code, or filename
            </p>
            <Link href="/search" className="text-primary hover:underline">
              Search now →
            </Link>
          </div>
          <div className="border border-border rounded-lg p-6 hover:bg-muted/50 transition-colors">
            <h3 className="font-semibold text-lg mb-2">Contribute</h3>
            <p className="text-muted-foreground mb-4">
              Share your study materials and help other students
            </p>
            <Link href="/signup" className="text-primary hover:underline">
              Get started →
            </Link>
          </div>
        </section>
      </div>
  )
}
