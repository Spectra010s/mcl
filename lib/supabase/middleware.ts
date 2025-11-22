import { createServerClient } from "@supabase/ssr"
import { NextResponse , type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
let supabaseRes = NextResponse.next({
            request,
          })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => supabaseRes.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

 // guard against upload page for non authenticated users
  if (!user && request.nextUrl.pathname === "/upload") {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return supabaseRes
}
