import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '../../test/test-utils'
import { LeaguesPage } from '../LeaguesPage'

describe('LeaguesPage', () => {
  describe('Page Display', () => {
    it('shows loading state initially', () => {
      const { container } = render(<LeaguesPage />)
      expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('displays page header', async () => {
      render(<LeaguesPage />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'My Leagues' })).toBeInTheDocument()
        expect(screen.getByText('Manage your leagues or create a new one')).toBeInTheDocument()
      })
    })

    it('displays create league button', async () => {
      render(<LeaguesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('create-league-button')).toBeInTheDocument()
      })
    })

    it('displays leagues after loading', async () => {
      render(<LeaguesPage />)

      await waitFor(() => {
        expect(screen.getByText('Test League')).toBeInTheDocument()
        expect(screen.getByText('Another League')).toBeInTheDocument()
      })
    })

    it('displays league details in cards', async () => {
      render(<LeaguesPage />)

      await waitFor(() => {
        // Check season info
        expect(screen.getAllByText('2024').length).toBeGreaterThan(0)
        // Check status
        expect(screen.getAllByText('Active').length).toBeGreaterThan(0)
      })
    })
  })

  describe('Create League Button', () => {
    it('displays create league button', async () => {
      render(<LeaguesPage />)

      await waitFor(() => {
        expect(screen.getByTestId('create-league-button')).toBeInTheDocument()
      })
    })
  })

  describe('League Cards', () => {
    it('displays role badges for commissioner', async () => {
      render(<LeaguesPage />)

      await waitFor(() => {
        // Mock user has Commissioner role for Test League (ID: 1)
        expect(screen.getByText(/Commissioner/)).toBeInTheDocument()
      })
    })

    it('league cards are clickable links', async () => {
      render(<LeaguesPage />)

      await waitFor(() => {
        expect(screen.getByText('Test League')).toBeInTheDocument()
      })

      // Find the link for Test League
      const leagueLink = screen.getByTestId('league-card-1')
      expect(leagueLink).toHaveAttribute('href', '/leagues/1')
    })
  })
})
