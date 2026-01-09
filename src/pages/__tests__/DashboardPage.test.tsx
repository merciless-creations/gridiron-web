import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { render } from '../../test/test-utils'

const { mockState } = vi.hoisted(() => ({
  mockState: {
    useMyTeams: vi.fn(),
    useMyLeagues: vi.fn(),
    useTakeControl: vi.fn(),
  },
}))

vi.mock('../../api/teamAssignments', () => ({
  useMyTeams: () => mockState.useMyTeams(),
  useTakeControl: () => mockState.useTakeControl(),
}))

vi.mock('../../api/leagues', () => ({
  useMyLeagues: () => mockState.useMyLeagues(),
}))

import { DashboardPage } from '../DashboardPage'

const mockMyTeams = [
  { teamId: 1, teamName: 'Eagles', leagueId: 1, leagueName: 'Test League', hasViewed: true },
  { teamId: 2, teamName: 'Falcons', leagueId: 1, leagueName: 'Test League', hasViewed: false },
]

const mockMyLeagues = [
  { id: 1, name: 'Test League', isActive: true },
  { id: 2, name: 'Another League', isActive: true },
]

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockState.useTakeControl.mockReturnValue({ mutate: vi.fn(), isPending: false })
  })

  describe('Loading State', () => {
    it('shows skeleton loading while fetching data', () => {
      mockState.useMyTeams.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })
      mockState.useMyLeagues.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })

      render(<DashboardPage />)

      // Should show skeleton loading state with proper aria label
      expect(screen.getByRole('status', { name: /loading dashboard/i })).toBeInTheDocument()

      // Should have animated skeleton elements
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('shows skeleton when only leagues are loading', () => {
      mockState.useMyTeams.mockReturnValue({
        data: mockMyTeams,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })
      mockState.useMyLeagues.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })

      render(<DashboardPage />)
      expect(screen.getByRole('status', { name: /loading dashboard/i })).toBeInTheDocument()
    })

    it('shows skeleton when only teams are loading', () => {
      mockState.useMyTeams.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })
      mockState.useMyLeagues.mockReturnValue({
        data: mockMyLeagues,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })

      render(<DashboardPage />)
      expect(screen.getByRole('status', { name: /loading dashboard/i })).toBeInTheDocument()
    })
  })

  describe('Success State', () => {
    beforeEach(() => {
      mockState.useMyTeams.mockReturnValue({
        data: mockMyTeams,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })
      mockState.useMyLeagues.mockReturnValue({
        data: mockMyLeagues,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })
    })

    it('renders leagues section', async () => {
      render(<DashboardPage />)
      await waitFor(() => {
        expect(screen.getByText('Test League')).toBeInTheDocument()
        expect(screen.getByText('Another League')).toBeInTheDocument()
      })
    })

    it('renders teams section', async () => {
      render(<DashboardPage />)
      await waitFor(() => {
        expect(screen.getByText('Eagles')).toBeInTheDocument()
        expect(screen.getByText('Falcons')).toBeInTheDocument()
      })
    })

    it('shows "New" badge for unviewed teams', async () => {
      render(<DashboardPage />)
      await waitFor(() => {
        // Check for "New" badge instead of emoji
        const newBadges = screen.getAllByText('New')
        expect(newBadges.length).toBe(1)
      })
    })

    it('does not show "New" badge for viewed teams', async () => {
      render(<DashboardPage />)
      await waitFor(() => {
        // Eagles should not have New badge
        const eaglesRow = screen.getByText('Eagles').closest('div[class*="cursor-pointer"]')
        expect(eaglesRow?.textContent).not.toContain('New')
      })
    })

    it('has smooth animations on content', () => {
      render(<DashboardPage />)

      // Check for animation classes
      const animatedElements = document.querySelectorAll('.animate-fade-in, .animate-slide-up')
      expect(animatedElements.length).toBeGreaterThan(0)
    })
  })

  describe('Error State', () => {
    it('shows error message with retry button when teams fetch fails', async () => {
      const refetchTeams = vi.fn()
      mockState.useMyTeams.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to fetch'),
        refetch: refetchTeams,
        isRefetching: false,
      })
      mockState.useMyLeagues.mockReturnValue({
        data: mockMyLeagues,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Teams')).toBeInTheDocument()
        expect(screen.getByText(/couldn't load your teams/i)).toBeInTheDocument()
      })

      // Check for retry button
      const retryButton = screen.getByRole('button', { name: /try again/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('shows error message with retry button when leagues fetch fails', async () => {
      const refetchLeagues = vi.fn()
      mockState.useMyTeams.mockReturnValue({
        data: mockMyTeams,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })
      mockState.useMyLeagues.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to fetch'),
        refetch: refetchLeagues,
        isRefetching: false,
      })

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Leagues')).toBeInTheDocument()
        expect(screen.getByText(/couldn't load your leagues/i)).toBeInTheDocument()
      })

      const retryButton = screen.getByRole('button', { name: /try again/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('shows combined error state when both fail', async () => {
      mockState.useMyTeams.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to fetch'),
        refetch: vi.fn(),
        isRefetching: false,
      })
      mockState.useMyLeagues.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to fetch'),
        refetch: vi.fn(),
        isRefetching: false,
      })

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Dashboard')).toBeInTheDocument()
        expect(screen.getByText(/leagues and teams/i)).toBeInTheDocument()
      })
    })

    it('calls refetch when retry button is clicked', async () => {
      const refetchTeams = vi.fn()
      mockState.useMyTeams.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to fetch'),
        refetch: refetchTeams,
        isRefetching: false,
      })
      mockState.useMyLeagues.mockReturnValue({
        data: mockMyLeagues,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })

      const user = userEvent.setup()
      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /try again/i }))
      expect(refetchTeams).toHaveBeenCalled()
    })

    it('shows retrying state when refetching', async () => {
      mockState.useMyTeams.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to fetch'),
        refetch: vi.fn(),
        isRefetching: true,
      })
      mockState.useMyLeagues.mockReturnValue({
        data: mockMyLeagues,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText(/retrying/i)).toBeInTheDocument()
      })

      // Button should be disabled while retrying
      const retryButton = screen.getByRole('button', { name: /retrying/i })
      expect(retryButton).toBeDisabled()
    })
  })

  describe('Empty State', () => {
    it('shows helpful empty state when no leagues with CTA', async () => {
      mockState.useMyTeams.mockReturnValue({
        data: mockMyTeams,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })
      mockState.useMyLeagues.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('No Leagues Yet')).toBeInTheDocument()
      })

      // Check for CTA link - use getByRole to specifically target the link
      const ctaLink = screen.getByRole('link', { name: /create your first league/i })
      expect(ctaLink).toHaveAttribute('href', '/leagues/create')
    })

    it('shows helpful empty state when no teams with CTA', async () => {
      mockState.useMyTeams.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })
      mockState.useMyLeagues.mockReturnValue({
        data: mockMyLeagues,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('No Teams Assigned')).toBeInTheDocument()
        expect(screen.getByText(/haven't been assigned to manage any teams/i)).toBeInTheDocument()
      })

      // Check for CTA link
      const ctaLink = screen.getByRole('link', { name: /browse leagues/i })
      expect(ctaLink).toHaveAttribute('href', '/leagues')
    })

    it('does not show Create League button when leagues list is empty', async () => {
      mockState.useMyTeams.mockReturnValue({
        data: mockMyTeams,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })
      mockState.useMyLeagues.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })

      render(<DashboardPage />)

      await waitFor(() => {
        // Should have the CTA in the empty state, not the regular button
        expect(screen.getByRole('link', { name: /create your first league/i })).toBeInTheDocument()
        // Should NOT have the "+ Create League" button since empty state has the CTA
        expect(screen.queryByText('+ Create League')).not.toBeInTheDocument()
      })
    })

    it('shows Create League button when leagues exist', async () => {
      mockState.useMyTeams.mockReturnValue({
        data: mockMyTeams,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })
      mockState.useMyLeagues.mockReturnValue({
        data: mockMyLeagues,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })

      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('+ Create League')).toBeInTheDocument()
      })
    })
  })

  describe('Welcome Modal', () => {
    it('shows welcome modal when clicking unviewed team', async () => {
      mockState.useMyTeams.mockReturnValue({
        data: mockMyTeams,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })
      mockState.useMyLeagues.mockReturnValue({
        data: mockMyLeagues,
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        isRefetching: false,
      })

      const user = userEvent.setup()
      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('Falcons')).toBeInTheDocument()
      })

      const falconsRow = screen.getByText('Falcons').closest('div[class*="cursor-pointer"]')
      await user.click(falconsRow!)

      await waitFor(() => {
        expect(screen.getByText(/welcome/i)).toBeInTheDocument()
      })
    })
  })
})
