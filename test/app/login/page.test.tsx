
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Login from '@/app/login/page'
import '@testing-library/jest-dom'
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest'
import { useRouter, useSearchParams } from 'next/navigation'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}))

// Mock supabase
const mockSignInWithPassword = vi.fn()
const mockSignInWithOAuth = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { email: 'test@example.com' }, error: null }),
        })),
      })),
    })),
  }),
}))

describe('LoginPage', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as Mock).mockReturnValue({ push: mockPush })
    ;(useSearchParams as Mock).mockReturnValue({ get: () => null }) // Default: no returnTo
  })

  it('renders login form', () => {
    render(<Login />)
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    expect(screen.getByLabelText('Email or Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('redirects to returnTo URL after successful login', async () => {
    ;(useSearchParams as Mock).mockReturnValue({ get: () => '/protected/resource' })
    mockSignInWithPassword.mockResolvedValueOnce({ error: null })

    render(<Login />)

    fireEvent.change(screen.getByLabelText('Email or Username'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/protected/resource')
    })
  })

  it('redirects to default URL if returnTo is missing', async () => {
    ;(useSearchParams as Mock).mockReturnValue({ get: () => null })
    mockSignInWithPassword.mockResolvedValueOnce({ error: null })

    render(<Login />)

    fireEvent.change(screen.getByLabelText('Email or Username'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/browse/faculties')
    })
  })

  it('passes returnTo to OAuth login', async () => {
    ;(useSearchParams as Mock).mockReturnValue({ get: () => '/protected/resource' })
    mockSignInWithOAuth.mockResolvedValueOnce({ error: null })

    render(<Login />)

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
})
