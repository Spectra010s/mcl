import { render, screen, fireEvent } from '@testing-library/react'
import { ResourceCarousel } from '@/components/ResourceCarousel'
import '@testing-library/jest-dom'
import { beforeAll, vi } from 'vitest'

beforeAll(() => {
  HTMLElement.prototype.scrollBy = vi.fn()
})

describe('ResourceCarousel', () => {
  const mockResources = [
    {
      id: 1,
      title: 'PDF File',
      file_type: 'pdf',
      download_count: 10,
      upload_date: '2025-11-01T00:00:00.000Z',
    },
    {
      id: 2,
      title: 'Word Document',
      file_type: 'document',
      download_count: 5,
      upload_date: '2025-11-02T00:00:00.000Z',
    },
    {
      id: 3,
      title: 'Presentation File',
      file_type: 'presentation',
      download_count: 2,
      upload_date: '2025-11-03T00:00:00.000Z',
    },
    {
      id: 4,
      title: 'Video File',
      file_type: 'video',
      download_count: 7,
      upload_date: '2025-11-04T00:00:00.000Z',
    },
  ]

  it('renders title and number of resources', () => {
    render(<ResourceCarousel title="Test Carousel" resources={mockResources} />)

    expect(screen.getByText('Test Carousel')).toBeInTheDocument()
    expect(screen.getByText('4 files')).toBeInTheDocument()
  })

  it('renders each resource title', () => {
    render(<ResourceCarousel title="Test Carousel" resources={mockResources} />)

    mockResources.forEach(resource => {
      expect(screen.getByText(resource.title)).toBeInTheDocument()
    })
  })

  it('renders correct file type labels', () => {
    render(<ResourceCarousel title="Test Carousel" resources={mockResources} />)

    expect(screen.getByText('PDF')).toBeInTheDocument()
    expect(screen.getByText('Document')).toBeInTheDocument()
    expect(screen.getByText('Presentation')).toBeInTheDocument()
    expect(screen.getByText('Video')).toBeInTheDocument()
  })

  it('does not render carousel if resources array is empty', () => {
    render(<ResourceCarousel title="Empty Carousel" resources={[]} />)

    expect(screen.queryByText('Empty Carousel')).not.toBeInTheDocument()
  })

  it('renders scroll buttons when more than 3 resources', () => {
    render(<ResourceCarousel title="Scroll Test" resources={mockResources} />)

    expect(screen.getByRole('button', { name: /left/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /right/i })).toBeInTheDocument()
  })

  it('calls scroll function when scroll buttons are clicked', () => {
    const { container } = render(<ResourceCarousel title="Scroll Test" resources={mockResources} />)

    const scrollContainer = container.querySelector(
      'div[style*="scroll-behavior"]',
    ) as HTMLDivElement
    scrollContainer.scrollBy = vi.fn()

    const leftButton = screen.getByRole('button', { name: /scroll left/i })
    const rightButton = screen.getByRole('button', { name: /scroll right/i })

    fireEvent.click(leftButton)
    fireEvent.click(rightButton)

    expect(scrollContainer.scrollBy).toHaveBeenCalledTimes(2)
  })
})
