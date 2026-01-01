import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest'

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: vi.fn() },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
}))

describe('updateSession', () => {
  let mockRequest: Partial<NextRequest>
  let mockCookiesSet: Mock

  beforeEach(() => {
    mockCookiesSet = vi.fn()

    mockRequest = {
      cookies: {
        getAll: vi.fn().mockReturnValue([]),
      },
      nextUrl: {
        pathname: '/upload',
        clone: vi.fn().mockImplementation(() => new URL('https://tayo.com/upload')),
      },
    }
  })

  it('returns NextResponse if user is authenticated', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    ;(createServerClient as Mock).mockReturnValueOnce({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } }) },
      from: vi.fn(),
    })

    const res = await updateSession(mockRequest as NextRequest)
    expect(res).toBeDefined()
    expect(res.cookies).toBeDefined()
  })

  it('redirects to /login with returnTo if unauthenticated and on /upload', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    ;(createServerClient as Mock).mockReturnValueOnce({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    })

    const res = await updateSession(mockRequest as NextRequest)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('https://tayo.com/login?returnTo=%2Fupload')
  })

  it('does not redirect if unauthenticated but not on /upload', async () => {
    mockRequest.nextUrl!.pathname = '/some-other-page'

    const { createServerClient } = await import('@supabase/ssr')
    ;(createServerClient as Mock).mockReturnValueOnce({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    })

    const res = await updateSession(mockRequest as NextRequest)
    expect(res.status).toBe(200)
  })

  it('returns 403 for unauthenticated access to /admin', async () => {
    mockRequest.nextUrl!.pathname = '/admin'
    const { createServerClient } = await import('@supabase/ssr')
    ;(createServerClient as Mock).mockReturnValueOnce({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    })

    const res = await updateSession(mockRequest as NextRequest)
    expect(res.status).toBe(403)
  })

  it('returns 403 for non-admin user accessing /admin', async () => {
    mockRequest.nextUrl!.pathname = '/admin'
    const { createServerClient } = await import('@supabase/ssr')
    const fromMock = vi.fn().mockReturnThis()
    ;(createServerClient as Mock).mockReturnValueOnce({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } }) },
      from: fromMock,
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { role: 'user' }, error: null }),
    })

    const res = await updateSession(mockRequest as NextRequest)
    expect(res.status).toBe(403)
  })

  it('allows admin user to access /admin', async () => {
    mockRequest.nextUrl!.pathname = '/admin'
    const { createServerClient } = await import('@supabase/ssr')
    ;(createServerClient as Mock).mockReturnValueOnce({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } }) },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
    })

    const res = await updateSession(mockRequest as NextRequest)
    expect(res.status).toBe(200)
  })
})
