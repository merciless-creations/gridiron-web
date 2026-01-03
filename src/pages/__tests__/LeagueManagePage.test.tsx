import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../test/test-utils'

const { mockNavigate, mockState } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockState: {
    useLeague: vi.fn(),
    useLeagueTeams: vi.fn(),
    useLeagueTeamAssignments: vi.fn(),
    useAssignGm: vi.fn(),
    useRemoveAssignment: vi.fn(),
    useSelfAssign: vi.fn(),
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ leagueId: '1' }),
  }
})

vi.mock('../../api/leagues', () => ({
  useLeague: () => mockState.useLeague(),
}))

vi.mock('../../api/teams', () => ({
  useLeagueTeams: () => mockState.useLeagueTeams(),
}))

vi.mock('../../api/teamAssignments', () => ({
  useLeagueTeamAssignments: () => mockState.useLeagueTeamAssignments(),
  useAssignGm: () => mockState.useAssignGm(),
  useRemoveAssignment: () => mockState.useRemoveAssignment(),
  useSelfAssign: () => mockState.useSelfAssign(),
}))

import { LeagueManagePage } from '../LeagueManagePage'

const mockLeague = { id: 1, name: 'Test League', isActive: true }

const mockTeams = [
  { id: 1, name: 'Eagles', city: 'Philadelphia' },
  { id: 2, name: 'Falcons', city: 'Atlanta' },
  { id: 3, name: 'Cowboys', city: 'Dallas' },
]

const mockAssignments = [
  { id: 1, teamId: 1, teamName: 'Eagles', email: 'gm1@test.com', displayName: 'GM One', controlState: 'HumanControlled', hasViewed: true },
  { id: 2, teamId: 2, teamName: 'Falcons', email: 'gm2@test.com', displayName: 'GM Two', controlState: 'Pending', hasViewed: false },
]

describe('LeagueManagePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.confirm = vi.fn(() => true)
    mockState.useAssignGm.mockReturnValue({ mutate: vi.fn(), isPending: false })
    mockState.useRemoveAssignment.mockReturnValue({ mutate: vi.fn(), isPending: false })
    mockState.useSelfAssign.mockReturnValue({ mutate: vi.fn(), isPending: false })
  })

  describe('Loading State', () => {
    it('shows loading spinner while fetching data', () => {
      mockState.useLeague.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      })
      mockState.useLeagueTeams.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      })
      mockState.useLeagueTeamAssignments.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      })

      const { container } = render(<LeagueManagePage />)
      expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    })
  })

  describe('Success State', () => {
    beforeEach(() => {
      mockState.useLeague.mockReturnValue({
        data: mockLeague,
        isLoading: false,
        isError: false,
      })
      mockState.useLeagueTeams.mockReturnValue({
        data: mockTeams,
        isLoading: false,
        isError: false,
      })
      mockState.useLeagueTeamAssignments.mockReturnValue({
        data: mockAssignments,
        isLoading: false,
        isError: false,
      })
    })

    it('renders league name in heading', async () => {
      render(<LeagueManagePage />)
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /manage test league/i })).toBeInTheDocument()
      })
    })

    it('renders team list', async () => {
      render(<LeagueManagePage />)
      await waitFor(() => {
        expect(screen.getByText('Eagles')).toBeInTheDocument()
        expect(screen.getByText('Falcons')).toBeInTheDocument()
        expect(screen.getByText('Cowboys')).toBeInTheDocument()
      })
    })

    it('shows active status for controlled teams', async () => {
      render(<LeagueManagePage />)
      await waitFor(() => {
        expect(screen.getByText('✅')).toBeInTheDocument()
      })
    })

    it('shows pending status for assigned but not viewed teams', async () => {
      render(<LeagueManagePage />)
      await waitFor(() => {
        expect(screen.getByText('⏳')).toBeInTheDocument()
      })
    })

    it('shows needs GM status for unassigned teams', async () => {
      render(<LeagueManagePage />)
      await waitFor(() => {
        expect(screen.getByText('🤖')).toBeInTheDocument()
      })
    })
  })

  describe('Error State', () => {
    it('shows error message when league fetch fails', async () => {
      mockState.useLeague.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Not found'),
      })
      mockState.useLeagueTeams.mockReturnValue({
        data: mockTeams,
        isLoading: false,
        isError: false,
      })
      mockState.useLeagueTeamAssignments.mockReturnValue({
        data: mockAssignments,
        isLoading: false,
        isError: false,
      })

      render(<LeagueManagePage />)
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })

    it('shows error message when teams fetch fails', async () => {
      mockState.useLeague.mockReturnValue({
        data: mockLeague,
        isLoading: false,
        isError: false,
      })
      mockState.useLeagueTeams.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Server error'),
      })
      mockState.useLeagueTeamAssignments.mockReturnValue({
        data: mockAssignments,
        isLoading: false,
        isError: false,
      })

      render(<LeagueManagePage />)
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Assign GM Action', () => {
    beforeEach(() => {
      mockState.useLeague.mockReturnValue({
        data: mockLeague,
        isLoading: false,
        isError: false,
      })
      mockState.useLeagueTeams.mockReturnValue({
        data: mockTeams,
        isLoading: false,
        isError: false,
      })
      mockState.useLeagueTeamAssignments.mockReturnValue({
        data: mockAssignments,
        isLoading: false,
        isError: false,
      })
    })

    it('opens assign modal when clicking assign button', async () => {
      const user = userEvent.setup()
      render(<LeagueManagePage />)
      
      await waitFor(() => {
        expect(screen.getByText('Cowboys')).toBeInTheDocument()
      })
      
      const assignButtons = screen.getAllByRole('button', { name: /assign gm/i })
      await user.click(assignButtons[0])
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })
  })

  describe('Remove Assignment Action', () => {
    beforeEach(() => {
      mockState.useLeague.mockReturnValue({
        data: mockLeague,
        isLoading: false,
        isError: false,
      })
      mockState.useLeagueTeams.mockReturnValue({
        data: mockTeams,
        isLoading: false,
        isError: false,
      })
      mockState.useLeagueTeamAssignments.mockReturnValue({
        data: mockAssignments,
        isLoading: false,
        isError: false,
      })
    })

    it('calls remove mutation when confirmed', async () => {
      const mockRemoveMutateAsync = vi.fn().mockResolvedValue({})
      mockState.useRemoveAssignment.mockReturnValue({ mutateAsync: mockRemoveMutateAsync, isPending: false })
      
      const user = userEvent.setup()
      render(<LeagueManagePage />)
      
      await waitFor(() => {
        expect(screen.getByText('Eagles')).toBeInTheDocument()
      })
      
      const removeButtons = screen.getAllByRole('button', { name: /remove/i })
      await user.click(removeButtons[0])
      
      await waitFor(() => {
        expect(mockRemoveMutateAsync).toHaveBeenCalled()
      })
    })
  })

  describe('Self Assign Action', () => {
    beforeEach(() => {
      mockState.useLeague.mockReturnValue({
        data: mockLeague,
        isLoading: false,
        isError: false,
      })
      mockState.useLeagueTeams.mockReturnValue({
        data: mockTeams,
        isLoading: false,
        isError: false,
      })
      mockState.useLeagueTeamAssignments.mockReturnValue({
        data: mockAssignments,
        isLoading: false,
        isError: false,
      })
    })

    it('calls self-assign mutation when clicking button', async () => {
      const mockSelfAssignMutateAsync = vi.fn().mockResolvedValue({})
      mockState.useSelfAssign.mockReturnValue({ mutateAsync: mockSelfAssignMutateAsync, isPending: false })
      
      const user = userEvent.setup()
      render(<LeagueManagePage />)
      
      await waitFor(() => {
        expect(screen.getByText('Cowboys')).toBeInTheDocument()
      })
      
      const selfAssignButtons = screen.getAllByRole('button', { name: /i'll take this/i })
      await user.click(selfAssignButtons[0])
      
      await waitFor(() => {
        expect(mockSelfAssignMutateAsync).toHaveBeenCalled()
      })
    })
  })
})
