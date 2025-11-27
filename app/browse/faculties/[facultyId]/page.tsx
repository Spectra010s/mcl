import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ facultyId: string }>
}
async function getDepartmentsData(facultyId: string) {
  const supabase = await createClient()

  const { data: faculty, error: facultyError } = await supabase
    .from('faculties')
    .select(
      `
      id,
      short_name,
      full_name,
      description,
      departments(
        id,
        short_name,
        full_name,
        description,
        academic_levels(count)
      )
    `,
    )
    .eq('id', facultyId)
    .single()

  if (facultyError) {
    console.error('Error fetching faculty:', facultyError)
    return null
  }

  return faculty
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const { facultyId } = params

  const faculty = await getDepartmentsData(facultyId)

  return {
    title: `${faculty?.full_name} - My Campus Library`,
    description: `Explore departments and General Courses within the ${faculty?.full_name}`,
  }
}

export default async function DepartmentsPage(props: PageProps) {
  const params = await props.params
  const { facultyId } = params

  const faculty = await getDepartmentsData(facultyId)

  const generalCourses = faculty?.departments?.find(d => d.full_name === 'General Courses')
  const regularDepartments =
    faculty?.departments?.filter(d => d.full_name !== 'General Courses') || []

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 py-12 md:px-6">
      {/* Header */}
      <div className="mb-12">
        <Link
          href="/browse/faculties"
          className="flex items-center gap-2 text-primary hover:underline mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Faculties
        </Link>
        <h1 className="text-4xl font-bold text-foreground mb-2">{faculty?.full_name}</h1>
        <p className="text-lg text-muted-foreground">{faculty?.description}</p>
      </div>

      {generalCourses && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">General Courses</h2>
          <Link href={`/browse/faculties/${facultyId}/departments/${generalCourses.id}`}>
            <Card className="hover:border-primary hover:shadow-lg transition-all cursor-pointer p-6 bg-primary/5 border-primary/20">
              <h3 className="font-semibold text-foreground text-lg mb-2">
                {generalCourses.full_name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{generalCourses.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Faculty-wide materials</span>
                <Button size="sm" variant="ghost">
                  Browse Levels →
                </Button>
              </div>
            </Card>
          </Link>
        </div>
      )}

      {/* Departments Grid */}
      <h2 className="text-2xl font-bold text-foreground mb-6">Departments</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regularDepartments.map(dept => (
          <Link key={dept.id} href={`/browse/faculties/${facultyId}/departments/${dept.id}`}>
            <Card className="h-full hover:border-primary hover:shadow-lg transition-all cursor-pointer p-6">
              <h3 className="font-semibold text-foreground text-lg mb-2">{dept.full_name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{dept.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Multiple levels</span>
                <Button size="sm" variant="ghost">
                  Explore →
                </Button>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {regularDepartments.length === 0 && !generalCourses && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No departments available yet</p>
        </div>
      )}
    </main>
  )
}
