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
    url.searchParams.set('returnTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (request.nextUrl.pathname === '/admin') {
    const forbiddenReponse = new NextResponse(
      `
        <!DOCTYPE html>
        <html>
        <head>
          <title>403 &#8212 Forbidden</title>
          <style>
            body {
              background: #fafafa;
              font-family: system-ui, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .box {
              text-align: center;
              padding: 40px;
            }
            h1 {
              font-size: 180px;
              margin-bottom: 10px;
              color: #111;
            }
            p {
              font-size: 40px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>403 Forbidden</h1>
            <p>You do not have permission to access this page.</p>
          </div>
        </body>
        </html>
      `,
      {
        status: 403,
        headers: { 'Content-Type': 'text/html' },
      },
    )

    if (!user) {
      return forbiddenReponse
    }

    const { data: profile, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error) {
      return new NextResponse('Internal Server Error: Could not verify permissions.', {
        status: 500,
      })
    }

    if (profile.role !== 'admin') {
      return forbiddenReponse
    }
  }

  return supabaseRes
}
