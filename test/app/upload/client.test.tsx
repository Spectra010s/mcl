import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest'
import UploadClient from '@/app/upload/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}))

vi.mock('@/hooks/use-unsaved-changes', () => ({
  useUnsavedChanges: vi.fn(),
}))

vi.mock('@/hooks/useUser', () => ({
  useUser: vi.fn(),
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}))

vi.mock('@/lib/api/upload', () => ({
  fetchFaculties: vi.fn(),
  fetchDepartments: vi.fn(),
  fetchLevels: vi.fn(),
  fetchCourses: vi.fn(),
  uploadResource: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  })),
}))

vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('UploadClient', () => {
  const mockPush = vi.fn()
  const mockSearchParams = new URLSearchParams()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as Mock).mockReturnValue({ push: mockPush })
    ;(useSearchParams as Mock).mockReturnValue(mockSearchParams)
    ;(useUser as Mock).mockReturnValue({ user: { id: 'user-123' } })
    ;(useUnsavedChanges as Mock).mockImplementation(() => undefined)
    ;(useQuery as Mock).mockReturnValue({ data: [], isLoading: false })
    ;(useMutation as Mock).mockReturnValue({ mutate: vi.fn(), isPending: false })
  })

  it('renders the upload form with correct title', () => {
    render(<UploadClient />)
    expect(screen.getByText('Upload Resource')).toBeDefined()
    expect(useUnsavedChanges).toHaveBeenCalledWith(false)
  })

  it('redirects guests to login with encoded form state', () => {
    ;(useUser as Mock).mockReturnValue({ user: null })
    render(<UploadClient />)

    const titleInput = screen.getByLabelText(/Title/i)
    fireEvent.change(titleInput, { target: { value: 'My Awesome Notes' } })
    expect(useUnsavedChanges).toHaveBeenLastCalledWith(true)

    const uploadButton = screen.getByRole('button', { name: /Upload File/i })
    fireEvent.click(uploadButton)

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/login?returnTo=%2Fupload%3Ftitle%3DMy%2BAwesome%2BNotes'),
    )
  })

  it('restores form data from URL parameters on mount', () => {
    const params = new URLSearchParams({
      title: 'Restored Title',
      description: 'Restored Description',
    })
    ;(useSearchParams as Mock).mockReturnValue(params)

    render(<UploadClient />)

    expect(screen.getByDisplayValue('Restored Title')).toBeDefined()
    expect(screen.getByDisplayValue('Restored Description')).toBeDefined()
    expect(toast.info).toHaveBeenCalledWith('Welcome back!', expect.any(Object))
  })
})
