import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, FileQuestion, GraduationCap, ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Computer-Based Tests | My Campus Library',
  description: 'Test your knowledge with computer-based tests for various courses',
}

interface Course {
  id: number
  course_code: string
  course_title: string
  academic_levels: {
    level_number: number
    departments: {
      short_name: string
      full_name: string
    }
  }
}

interface CBT {
  id: number
  title: string
  description: string | null
  time_limit_minutes: number | null
  passing_score: number
  courses: Course
  questionCount: number
}

async function getCBTs() {
  const supabase = await createClient()

  const { data: cbts, error } = await supabase
    .from('cbts')
    .select(
      `
      id,
      title,
      description,
      time_limit_minutes,
      passing_score,
      questions(count),
      courses!inner(
        id,
        course_code,
        course_title,
        academic_levels(
          level_number,
          departments(
            short_name,
            full_name
          )
        )
      )
    `,
    )
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error

  const formattedCbts = cbts.map((cbt: any): CBT => {
    const course = Array.isArray(cbt.courses) ? cbt.courses[0] : cbt.courses
    const academicLevel = Array.isArray(course.academic_levels)
      ? course.academic_levels[0]
      : course.academic_levels
    const department = Array.isArray(academicLevel?.departments)
      ? academicLevel.departments[0]
      : academicLevel?.departments

    // Extract question count safely
    const questionCount = cbt.questions?.[0]?.count || 0

    return {
      id: cbt.id,
      title: cbt.title,
      description: cbt.description,
      time_limit_minutes: cbt.time_limit_minutes,
      passing_score: cbt.passing_score,
      questionCount,
      courses: {
        id: course.id,
        course_code: course.course_code,
        course_title: course.course_title,
        academic_levels: {
          level_number: academicLevel?.level_number,
          departments: {
            short_name: department?.short_name,
            full_name: department?.full_name,
          },
        },
      },
    }
  })

  // Filter out CBTs with no questions
  return formattedCbts.filter(cbt => cbt.questionCount > 0)
}

export default async function CBTsPage() {
  const cbts = await getCBTs()

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 py-12 md:px-6">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Test Your Knowledge</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Challenge yourself with computer-based tests designed to help you prepare for exams and
          assess your understanding.
        </p>
      </div>

      {/* CBT Grid */}
      {cbts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cbts.map(cbt => (
            <Card
              key={cbt.id}
              className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardDescription className="flex items-center gap-2 mb-2">
                      <GraduationCap className="w-4 h-4" />
                      {cbt.courses.course_code}
                    </CardDescription>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {cbt.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {cbt.description || cbt.courses.course_title}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {cbt.time_limit_minutes ? (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {cbt.time_limit_minutes} min
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      No time limit
                    </Badge>
                  )}
                  <Badge variant="outline">Pass: {cbt.passing_score}%</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {cbt.courses.academic_levels?.departments?.short_name} •{' '}
                    {cbt.courses.academic_levels?.level_number}L
                  </span>
                  <Button asChild size="sm">
                    <Link href={`/cbts/${cbt.id}`}>
                      Start Test
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileQuestion className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Tests Available</h2>
          <p className="text-muted-foreground mb-6">
            Check back later for new computer-based tests.
          </p>
          <Button asChild variant="outline">
            <Link href="/browse/faculties">Browse Resources</Link>
          </Button>
        </div>
      )}
    </main>
  )
}
