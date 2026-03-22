import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CBTClient from './client'
import type { Metadata } from 'next'
import { generateBreadcrumbSchema, createSchema } from '@/lib/schema'
import { baseUrl } from '@/constants'
import { buildLoginRedirect } from '@/lib/auth/loginRedirect'

interface PageProps {
  params: Promise<{
    cbtId: string
  }>
}

interface RawAcademicLevel {
  level_number: number
  departments:
    | {
        short_name: string
        full_name: string
      }
    | {
        short_name: string
        full_name: string
      }[]
}

interface RawCourse {
  id: number
  course_code: string
  course_title: string
  academic_levels: RawAcademicLevel | RawAcademicLevel[]
}

interface RawCBT {
  id: number
  title: string
  description: string | null
  time_limit_minutes: number | null
  passing_score: number
  courses: RawCourse | RawCourse[]
}

async function getCBTData(cbtId: string) {
  const supabase = await createClient()

  const [cbtResult, attemptsResult] = await Promise.all([
    supabase
      .from('cbts')
      .select(
        `
                id,
                title,
                description,
                time_limit_minutes,
                passing_score,
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
      .eq('id', cbtId)
      .eq('is_active', true)
      .single(),
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user)
        return {
          data: [],
          error: null,
        }
      return supabase
        .from('cbt_attempts')
        .select('*')
        .eq('cbt_id', cbtId)
        .eq('user_id', user.id)
        .order('started_at', {
          ascending: false,
        })
    }),
  ])

  if (cbtResult.error) {
    return null
  }

  const rawCbt = cbtResult.data as RawCBT
  const course = Array.isArray(rawCbt.courses) ? rawCbt.courses[0] : rawCbt.courses
  const academicLevel = Array.isArray(course.academic_levels)
    ? course.academic_levels[0]
    : course.academic_levels
  const department = Array.isArray(academicLevel?.departments)
    ? academicLevel.departments[0]
    : academicLevel?.departments

  const cbt = {
    id: rawCbt.id,
    title: rawCbt.title,
    description: rawCbt.description,
    time_limit_minutes: rawCbt.time_limit_minutes,
    passing_score: rawCbt.passing_score,
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

  return {
    cbt,
    attempts: attemptsResult.data || [],
  }
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const data = await getCBTData(params.cbtId)

  if (!data?.cbt)
    return {
      title: 'Test Not Found',
    }

  return {
    title: `${data.cbt.title} | ${data.cbt.courses.course_code} Quiz`,
    description:
      data.cbt.description ||
      `Take the CBT for ${data.cbt.courses.course_title}. Pass mark: ${data.cbt.passing_score}%.`,
  }
}

export default async function CBTPage(props: PageProps) {
  const params = await props.params
  const { cbtId } = params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(buildLoginRedirect(`/cbts/${cbtId}`, 'Please log in to continue to this CBT.'))
  }

  const data = await getCBTData(cbtId)

  if (!data || !data.cbt) {
    redirect('/cbts')
  }

  const breadcrumbNode = generateBreadcrumbSchema([
    {
      name: 'Computer-Based Tests',
      url: `${baseUrl}/cbts`,
    },
    {
      name: data.cbt.title,
      url: `${baseUrl}/cbts/${cbtId}`,
    },
  ])

  const jsonLd = createSchema([breadcrumbNode])

  return (
    <>
      <script
        id={`breadcrumb-cbt-${cbtId}`}
        key={`breadcrumb-${cbtId}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CBTClient cbt={data.cbt} attempts={data.attempts} userId={user.id} />
    </>
  )
}
