import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseRes = NextResponse.next({
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
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseRes.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // guard against upload page for non authenticated users
  if (!user && request.nextUrl.pathname === '/upload') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  
const { data: profile, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

if (user && error) {
    return new NextResponse('Internal Server Error: Could not verify permissions.', {
        status: 500 
    });
}

if (request.nextUrl.pathname === '/admin') {
  if (!user || profile.role !== "admin") {
     return new NextResponse('Forbidden: You do not have permission to access this page.', { 
        status: 403 
      });
  }
}

  return supabaseRes
}
