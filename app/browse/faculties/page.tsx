import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Browse Faculties - My Campus Library',
  description: 'Explore Faculties within Fuoye',
}

export default async function FacultiesPage() {
  const supabase = await createClient()

  const { data: faculties, error } = await supabase
    .from('faculties')
    .select(
      `
      id,
      short_name,
      full_name,
      description,
      departments:departments(count)
    `,
    )
    .order('full_name')

  if (error) {
    console.error('Error fetching faculties:', error)
  }

  return (
    <>
      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 md:px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">Browse the Faculty</h1>
          <p className="text-lg text-muted-foreground">
            Select a faculty to explore its departments and courses
          </p>
        </div>

        {/* Faculties Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faculties?.map(faculty => (
            <Link key={faculty.id} href={`/browse/faculties/${faculty.id}`}>
              <Card className="h-full hover:border-primary hover:shadow-lg transition-all cursor-pointer p-6">
                <div className="flex items-start gap-4 h-full flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">{faculty.full_name}</h3>
                  </div>
                  <div className="w-full">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {faculty.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {faculty.departments?.[0]?.count || 0} departments
                      </span>
                      <Button size="sm" variant="ghost">
                        Explore →
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {!faculties ||
          (faculties.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No faculties available yet</p>
            </div>
          ))}
      </main>
    </>
  )
}
