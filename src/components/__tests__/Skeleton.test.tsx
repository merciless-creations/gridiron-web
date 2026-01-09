import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton, SkeletonCard, SkeletonRow, DashboardSkeleton } from '../Skeleton'

describe('Skeleton', () => {
  it('renders with default classes', () => {
    const { container } = render(<Skeleton />)

    const skeleton = container.firstChild
    expect(skeleton).toHaveClass('animate-pulse', 'bg-gridiron-bg-tertiary', 'rounded')
  })

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="h-6 w-48" />)

    const skeleton = container.firstChild
    expect(skeleton).toHaveClass('h-6', 'w-48')
  })

  it('is hidden from screen readers', () => {
    const { container } = render(<Skeleton />)

    const skeleton = container.firstChild
    expect(skeleton).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('SkeletonRow', () => {
  it('renders skeleton elements for a row', () => {
    const { container } = render(<SkeletonRow />)

    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(2) // text and button
  })

  it('has proper layout classes', () => {
    const { container } = render(<SkeletonRow />)

    const row = container.firstChild
    expect(row).toHaveClass('flex', 'items-center', 'justify-between')
  })
})

describe('SkeletonCard', () => {
  it('renders a card with skeleton content', () => {
    const { container } = render(<SkeletonCard />)

    expect(container.querySelector('.card')).toBeInTheDocument()
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('has fade-in animation', () => {
    const { container } = render(<SkeletonCard />)

    expect(container.querySelector('.animate-fade-in')).toBeInTheDocument()
  })
})

describe('DashboardSkeleton', () => {
  it('renders with accessible loading status', () => {
    render(<DashboardSkeleton />)

    expect(screen.getByRole('status', { name: /loading dashboard/i })).toBeInTheDocument()
  })

  it('renders both leagues and teams skeletons by default', () => {
    const { container } = render(<DashboardSkeleton />)

    const cards = container.querySelectorAll('.card')
    expect(cards.length).toBe(2)
  })

  it('can hide leagues skeleton', () => {
    const { container } = render(<DashboardSkeleton showLeagues={false} />)

    const cards = container.querySelectorAll('.card')
    expect(cards.length).toBe(1)
  })

  it('can hide teams skeleton', () => {
    const { container } = render(<DashboardSkeleton showTeams={false} />)

    const cards = container.querySelectorAll('.card')
    expect(cards.length).toBe(1)
  })

  it('renders multiple skeleton rows', () => {
    const { container } = render(<DashboardSkeleton />)

    const rows = container.querySelectorAll('.bg-gridiron-dark')
    expect(rows.length).toBeGreaterThan(0)
  })

  it('has fade-in animation', () => {
    const { container } = render(<DashboardSkeleton />)

    expect(container.querySelector('.animate-fade-in')).toBeInTheDocument()
  })
})
