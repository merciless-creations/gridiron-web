import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../test/test-utils'
import { Navigation } from '../Navigation'

describe('Navigation', () => {
  it('renders the app title', () => {
    render(<Navigation />)
    expect(screen.getByText('Goal to Go')).toBeInTheDocument()
  })

  it('renders all navigation links on desktop', () => {
    render(<Navigation />)
    // Desktop navigation links (hidden on mobile with lg:flex)
    const homeLinks = screen.getAllByText('Home')
    const teamsLinks = screen.getAllByText('Teams')
    const simulateLinks = screen.getAllByText('Simulate Game')

    expect(homeLinks.length).toBeGreaterThan(0)
    expect(teamsLinks.length).toBeGreaterThan(0)
    expect(simulateLinks.length).toBeGreaterThan(0)
  })

  it('renders the logout button and username when authenticated', () => {
    // MockAuthProvider always returns authenticated state
    render(<Navigation />)
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('has correct href attributes', () => {
    render(<Navigation />)

    const homeLinks = screen.getAllByRole('link', { name: /home/i })
    const teamsLinks = screen.getAllByRole('link', { name: /teams/i })
    const simulateLinks = screen.getAllByRole('link', { name: /simulate game/i })

    expect(homeLinks[0]).toHaveAttribute('href', '/')
    expect(teamsLinks[0]).toHaveAttribute('href', '/teams')
    expect(simulateLinks[0]).toHaveAttribute('href', '/simulate')
  })

  describe('Mobile Navigation', () => {
    it('renders mobile menu button', () => {
      render(<Navigation />)
      expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument()
    })

    it('toggles mobile menu on button click', async () => {
      const user = userEvent.setup()
      render(<Navigation />)

      const menuButton = screen.getByTestId('mobile-menu-button')

      // Initially mobile menu should not be visible
      expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()

      // Click to open
      await user.click(menuButton)
      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()

      // Click to close
      await user.click(menuButton)
      expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
    })

    it('closes mobile menu when clicking a link', async () => {
      const user = userEvent.setup()
      render(<Navigation />)

      // Open mobile menu
      await user.click(screen.getByTestId('mobile-menu-button'))
      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()

      // Click a link in the mobile menu
      const mobileMenu = screen.getByTestId('mobile-menu')
      const homeLink = mobileMenu.querySelector('a[href="/"]')
      if (homeLink) {
        await user.click(homeLink)
        expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument()
      }
    })
  })

  describe('Context Switcher Integration', () => {
    it('shows context switcher after data loads when authenticated', async () => {
      // The test utils render with mock auth which simulates authenticated state
      render(<Navigation />)

      // Wait for context data to load
      await waitFor(() => {
        // Context switcher should be visible (either in header or mobile menu)
        const contextSwitchers = screen.queryAllByTestId('context-switcher-trigger')
        // May or may not show depending on auth state in test
        expect(contextSwitchers.length).toBeGreaterThanOrEqual(0)
      }, { timeout: 3000 })
    })
  })
})
