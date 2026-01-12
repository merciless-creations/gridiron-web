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

  it('renders the user avatar menu when authenticated', () => {
    // MockAuthProvider always returns authenticated state
    render(<Navigation />)
    // Avatar menu trigger should be visible
    expect(screen.getByTestId('user-avatar-menu-trigger')).toBeInTheDocument()
    // User initials should be visible in avatar
    expect(screen.getByTestId('user-avatar-initials')).toBeInTheDocument()
    expect(screen.getByTestId('user-avatar-initials')).toHaveTextContent('TU')
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

  describe('User Avatar Menu Integration', () => {
    it('shows avatar menu with user info when authenticated', async () => {
      // The test utils render with mock auth which simulates authenticated state
      render(<Navigation />)

      // Avatar menu trigger should be present
      const avatarTrigger = screen.getByTestId('user-avatar-menu-trigger')
      expect(avatarTrigger).toBeInTheDocument()

      // Should have correct aria attributes
      expect(avatarTrigger).toHaveAttribute('aria-haspopup', 'menu')
      expect(avatarTrigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('opens avatar menu dropdown on click', async () => {
      const user = userEvent.setup()
      render(<Navigation />)

      // Click avatar trigger
      await user.click(screen.getByTestId('user-avatar-menu-trigger'))

      // Dropdown should appear
      await waitFor(() => {
        expect(screen.getByTestId('user-avatar-menu-dropdown')).toBeInTheDocument()
      })

      // Should contain profile link and logout
      expect(screen.getByTestId('avatar-menu-profile-link')).toBeInTheDocument()
      expect(screen.getByTestId('avatar-menu-logout')).toBeInTheDocument()
    })
  })
})
