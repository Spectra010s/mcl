import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignUp from '@/app/signup/page'
import '@testing-library/jest-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// Mock supabase
const mockSignUp = vi.fn()
const mockSignInWithOAuth = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
      signInWithOAuth: mockSignInWithOAuth,
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: null }), // User doesn't exist
        })),
      })),
    })),
  }),
}))

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders signup form', async () => {
    render(await SignUp({}))
    expect(screen.getByText('Create Account')).toBeInTheDocument()
  })

  it('passes returnTo to OAuth signup', async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ error: null })

    render(
      await SignUp({
        searchParams: Promise.resolve({ returnTo: '/protected/resource' }),
      }),
    )

    fireEvent.click(screen.getByText('Google'))

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            redirectTo: expect.stringContaining('next=%2Fprotected%2Fresource'),
          }),
        }),
      )
    })
  })

  it('renders "Sign in" link with returnTo', async () => {
    render(
      await SignUp({
        searchParams: Promise.resolve({ returnTo: '/protected/resource' }),
      }),
    )

    const loginLink = screen.getByText('Sign in')
    expect(loginLink.closest('a')).toHaveAttribute(
      'href',
      '/login?returnTo=%2Fprotected%2Fresource',
    )
  })
})
