import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../test/test-utils'
import { UserAvatarMenu } from '../UserAvatarMenu'

describe('UserAvatarMenu', () => {
  describe('Authenticated State', () => {
    // MockAuthProvider in test-utils returns authenticated state with Test User

    it('renders avatar pill with user initials', () => {
      render(<UserAvatarMenu />)
      expect(screen.getByTestId('user-avatar-menu-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('user-avatar-initials')).toHaveTextContent('TU')
    })

    it('renders user name', () => {
      render(<UserAvatarMenu />)
      expect(screen.getByTestId('user-avatar-name')).toHaveTextContent('Test User')
    })

    it('has correct aria attributes on trigger', () => {
      render(<UserAvatarMenu />)
      const trigger = screen.getByTestId('user-avatar-menu-trigger')
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).toHaveAttribute('aria-label', 'User menu for Test User')
    })
  })

  describe('Dropdown Behavior', () => {
    it('opens dropdown when clicking avatar pill', async () => {
      const user = userEvent.setup()
      render(<UserAvatarMenu />)

      await user.click(screen.getByTestId('user-avatar-menu-trigger'))

      expect(screen.getByTestId('user-avatar-menu-dropdown')).toBeInTheDocument()
      expect(screen.getByTestId('user-avatar-menu-trigger')).toHaveAttribute('aria-expanded', 'true')
    })

    it('closes dropdown when clicking avatar pill again', async () => {
      const user = userEvent.setup()
      render(<UserAvatarMenu />)

      // Open
      await user.click(screen.getByTestId('user-avatar-menu-trigger'))
      expect(screen.getByTestId('user-avatar-menu-dropdown')).toBeInTheDocument()

      // Close
      await user.click(screen.getByTestId('user-avatar-menu-trigger'))
      expect(screen.queryByTestId('user-avatar-menu-dropdown')).not.toBeInTheDocument()
    })

    it('closes dropdown on escape key', async () => {
      const user = userEvent.setup()
      render(<UserAvatarMenu />)

      await user.click(screen.getByTestId('user-avatar-menu-trigger'))
      expect(screen.getByTestId('user-avatar-menu-dropdown')).toBeInTheDocument()

      await user.keyboard('{Escape}')
      expect(screen.queryByTestId('user-avatar-menu-dropdown')).not.toBeInTheDocument()
    })

    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <UserAvatarMenu />
        </div>
      )

      await user.click(screen.getByTestId('user-avatar-menu-trigger'))
      expect(screen.getByTestId('user-avatar-menu-dropdown')).toBeInTheDocument()

      await user.click(screen.getByTestId('outside'))
      expect(screen.queryByTestId('user-avatar-menu-dropdown')).not.toBeInTheDocument()
    })
  })

  describe('Dropdown Content', () => {
    it('renders profile link in dropdown', async () => {
      const user = userEvent.setup()
      render(<UserAvatarMenu />)

      await user.click(screen.getByTestId('user-avatar-menu-trigger'))

      const profileLink = screen.getByTestId('avatar-menu-profile-link')
      expect(profileLink).toBeInTheDocument()
      expect(profileLink).toHaveAttribute('href', '/profile')
    })

    it('renders logout button in dropdown', async () => {
      const user = userEvent.setup()
      render(<UserAvatarMenu />)

      await user.click(screen.getByTestId('user-avatar-menu-trigger'))

      expect(screen.getByTestId('avatar-menu-logout')).toBeInTheDocument()
    })

    it('renders context switcher section in dropdown', async () => {
      const user = userEvent.setup()
      render(<UserAvatarMenu />)

      await user.click(screen.getByTestId('user-avatar-menu-trigger'))

      // Context switcher section header
      expect(screen.getByText('Switch Context')).toBeInTheDocument()
      // Embedded context switcher should be present
      expect(screen.getByTestId('context-switcher-embedded')).toBeInTheDocument()
    })

    it('shows user email in dropdown header when different from name', async () => {
      const user = userEvent.setup()
      render(<UserAvatarMenu />)

      await user.click(screen.getByTestId('user-avatar-menu-trigger'))

      // Email is shown (testuser@example.com from MockAuthProvider)
      expect(screen.getByText('testuser@example.com')).toBeInTheDocument()
    })

    it('dropdown has correct role attributes', async () => {
      const user = userEvent.setup()
      render(<UserAvatarMenu />)

      await user.click(screen.getByTestId('user-avatar-menu-trigger'))

      const dropdown = screen.getByTestId('user-avatar-menu-dropdown')
      expect(dropdown).toHaveAttribute('role', 'menu')
    })

    it('renders theme switcher in dropdown', async () => {
      const user = userEvent.setup()
      render(<UserAvatarMenu />)

      await user.click(screen.getByTestId('user-avatar-menu-trigger'))

      // Theme label should be visible
      expect(screen.getByText('Theme')).toBeInTheDocument()
      // Theme switcher should be present
      expect(screen.getByTestId('theme-switcher')).toBeInTheDocument()
    })

    it('renders all theme options in dropdown', async () => {
      const user = userEvent.setup()
      render(<UserAvatarMenu />)

      await user.click(screen.getByTestId('user-avatar-menu-trigger'))

      // All three theme options should be available
      expect(screen.getByTestId('theme-option-light')).toBeInTheDocument()
      expect(screen.getByTestId('theme-option-dark')).toBeInTheDocument()
      expect(screen.getByTestId('theme-option-system')).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('closes dropdown after profile link clicked', async () => {
      const user = userEvent.setup()
      render(<UserAvatarMenu />)

      await user.click(screen.getByTestId('user-avatar-menu-trigger'))
      await user.click(screen.getByTestId('avatar-menu-profile-link'))

      await waitFor(() => {
        expect(screen.queryByTestId('user-avatar-menu-dropdown')).not.toBeInTheDocument()
      })
    })

    it('closes dropdown after logout clicked', async () => {
      const user = userEvent.setup()
      render(<UserAvatarMenu />)

      await user.click(screen.getByTestId('user-avatar-menu-trigger'))
      await user.click(screen.getByTestId('avatar-menu-logout'))

      expect(screen.queryByTestId('user-avatar-menu-dropdown')).not.toBeInTheDocument()
    })

    it('logout button has danger styling', async () => {
      const user = userEvent.setup()
      render(<UserAvatarMenu />)

      await user.click(screen.getByTestId('user-avatar-menu-trigger'))

      const logoutButton = screen.getByTestId('avatar-menu-logout')
      expect(logoutButton).toHaveClass('text-red-400')
    })
  })

  describe('Accessibility', () => {
    it('has proper menu item roles', async () => {
      const user = userEvent.setup()
      render(<UserAvatarMenu />)

      await user.click(screen.getByTestId('user-avatar-menu-trigger'))

      const profileLink = screen.getByTestId('avatar-menu-profile-link')
      const logoutButton = screen.getByTestId('avatar-menu-logout')

      expect(profileLink).toHaveAttribute('role', 'menuitem')
      expect(logoutButton).toHaveAttribute('role', 'menuitem')
    })

    it('context switcher section has group role', async () => {
      const user = userEvent.setup()
      render(<UserAvatarMenu />)

      await user.click(screen.getByTestId('user-avatar-menu-trigger'))

      // The group containing context switcher
      const contextGroup = screen.getByRole('group', { name: /league and team selection/i })
      expect(contextGroup).toBeInTheDocument()
    })
  })
})

describe('UserAvatarMenu - Initials Generation', () => {
  // Note: These tests verify the getInitials function behavior
  // The MockAuthProvider provides "Test User" which gives "TU" initials

  it('generates correct initials for Test User', () => {
    render(<UserAvatarMenu />)
    // "Test User" -> "TU"
    expect(screen.getByTestId('user-avatar-initials')).toHaveTextContent('TU')
  })
})
