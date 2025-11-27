import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
  })),
}))

describe('updateSession', () => {
  let mockRequest: Partial<NextRequest>
  let mockCookiesSet: vi.Mock

  beforeEach(() => {
    mockCookiesSet = vi.fn()

    mockRequest = {
      cookies: {
        getAll: vi.fn().mockReturnValue([]),
        set: vi.fn(),
      },
      nextUrl: {
        pathname: '/upload',
        clone: vi.fn().mockImplementation(() => new URL('https://tayo.com/upload')),
      },
    }
  })

  it('returns NextResponse if user is authenticated', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    ;(createServerClient as any).mockReturnValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } }),
      },
    })

    const res = await updateSession(mockRequest as NextRequest)
    expect(res).toBeDefined()
    expect(res.cookies).toBeDefined()
  })

  it('redirects to /login if unauthenticated and on /upload', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    ;(createServerClient as any).mockReturnValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    })

    const res = await updateSession(mockRequest as NextRequest)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('https://tayo.com/login')
  })

  it('does not redirect if unauthenticated but not on /upload', async () => {
    mockRequest!.nextUrl!.pathname = '/some-other-page'

    const { createServerClient } = await import('@supabase/ssr')
    ;(createServerClient as any).mockReturnValueOnce({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    })

    const res = await updateSession(mockRequest as NextRequest)
    expect(res.status).toBe(200)
  })
})
