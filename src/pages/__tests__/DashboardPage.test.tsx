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
    it('shows loading spinner while fetching data', () => {
      mockState.useMyTeams.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      })
      mockState.useMyLeagues.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      })

      const { container } = render(<DashboardPage />)
      expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    })
  })

  describe('Success State', () => {
    beforeEach(() => {
      mockState.useMyTeams.mockReturnValue({
        data: mockMyTeams,
        isLoading: false,
        isError: false,
        error: null,
      })
      mockState.useMyLeagues.mockReturnValue({
        data: mockMyLeagues,
        isLoading: false,
        isError: false,
        error: null,
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

    it('shows new indicator for unviewed teams', async () => {
      render(<DashboardPage />)
      await waitFor(() => {
        const falconsRow = screen.getByText('Falcons').closest('div')
        expect(falconsRow?.textContent).toContain('🆕')
      })
    })

    it('does not show new indicator for viewed teams', async () => {
      render(<DashboardPage />)
      await waitFor(() => {
        const eaglesRow = screen.getByText('Eagles').closest('div')
        expect(eaglesRow?.textContent).not.toContain('🆕')
      })
    })
  })

  describe('Error State', () => {
    it('shows error message when teams fetch fails', async () => {
      mockState.useMyTeams.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to fetch'),
      })
      mockState.useMyLeagues.mockReturnValue({
        data: mockMyLeagues,
        isLoading: false,
        isError: false,
        error: null,
      })

      render(<DashboardPage />)
      await waitFor(() => {
        expect(screen.getByText(/error loading/i)).toBeInTheDocument()
      })
    })

    it('shows error message when leagues fetch fails', async () => {
      mockState.useMyTeams.mockReturnValue({
        data: mockMyTeams,
        isLoading: false,
        isError: false,
        error: null,
      })
      mockState.useMyLeagues.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to fetch'),
      })

      render(<DashboardPage />)
      await waitFor(() => {
        expect(screen.getByText(/error loading/i)).toBeInTheDocument()
      })
    })
  })

  describe('Empty State', () => {
    it('shows empty message when no leagues', async () => {
      mockState.useMyTeams.mockReturnValue({
        data: mockMyTeams,
        isLoading: false,
        isError: false,
        error: null,
      })
      mockState.useMyLeagues.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      })

      render(<DashboardPage />)
      await waitFor(() => {
        expect(screen.getByText(/no leagues/i)).toBeInTheDocument()
      })
    })

    it('shows empty message when no teams', async () => {
      mockState.useMyTeams.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      })
      mockState.useMyLeagues.mockReturnValue({
        data: mockMyLeagues,
        isLoading: false,
        isError: false,
        error: null,
      })

      render(<DashboardPage />)
      await waitFor(() => {
        expect(screen.getByText(/no teams/i)).toBeInTheDocument()
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
      })
      mockState.useMyLeagues.mockReturnValue({
        data: mockMyLeagues,
        isLoading: false,
        isError: false,
        error: null,
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
