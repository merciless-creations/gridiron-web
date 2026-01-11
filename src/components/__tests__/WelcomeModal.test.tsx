import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WelcomeModal } from '../WelcomeModal'

describe('WelcomeModal', () => {
  const defaultProps = {
    teamName: 'Eagles',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the welcome message with team name', () => {
      render(<WelcomeModal {...defaultProps} />)

      expect(screen.getByText('Welcome to the Eagles!')).toBeInTheDocument()
      expect(screen.getByText("You're now the GM.")).toBeInTheDocument()
    })

    it('displays GM capabilities list', () => {
      render(<WelcomeModal {...defaultProps} />)

      expect(screen.getByText('As GM, you can:')).toBeInTheDocument()
      expect(screen.getByText('Manage your roster')).toBeInTheDocument()
      expect(screen.getByText('Set your depth chart')).toBeInTheDocument()
      expect(screen.getByText('Make trades and signings')).toBeInTheDocument()
    })

    it('renders Confirm and Cancel buttons', () => {
      render(<WelcomeModal {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('renders with different team names', () => {
      render(<WelcomeModal {...defaultProps} teamName="Falcons" />)

      expect(screen.getByText('Welcome to the Falcons!')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('calls onConfirm when Confirm button is clicked', async () => {
      const onConfirm = vi.fn()
      const user = userEvent.setup()
      render(<WelcomeModal {...defaultProps} onConfirm={onConfirm} />)

      await user.click(screen.getByRole('button', { name: 'Confirm' }))

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when Cancel button is clicked', async () => {
      const onCancel = vi.fn()
      const user = userEvent.setup()
      render(<WelcomeModal {...defaultProps} onCancel={onCancel} />)

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(onCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('Loading State', () => {
    it('shows loading text when isLoading is true', () => {
      render(<WelcomeModal {...defaultProps} isLoading={true} />)

      expect(screen.getByRole('button', { name: 'Confirming...' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Confirm' })).not.toBeInTheDocument()
    })

    it('disables both buttons when isLoading is true', () => {
      render(<WelcomeModal {...defaultProps} isLoading={true} />)

      expect(screen.getByRole('button', { name: 'Confirming...' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    })

    it('enables buttons when isLoading is false', () => {
      render(<WelcomeModal {...defaultProps} isLoading={false} />)

      expect(screen.getByRole('button', { name: 'Confirm' })).not.toBeDisabled()
      expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled()
    })

    it('prevents clicking Confirm when loading', async () => {
      const onConfirm = vi.fn()
      const user = userEvent.setup()
      render(<WelcomeModal {...defaultProps} onConfirm={onConfirm} isLoading={true} />)

      const confirmButton = screen.getByRole('button', { name: 'Confirming...' })
      await user.click(confirmButton)

      expect(onConfirm).not.toHaveBeenCalled()
    })

    it('prevents clicking Cancel when loading', async () => {
      const onCancel = vi.fn()
      const user = userEvent.setup()
      render(<WelcomeModal {...defaultProps} onCancel={onCancel} isLoading={true} />)

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      expect(onCancel).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has dialog role', () => {
      render(<WelcomeModal {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('has aria-modal attribute', () => {
      render(<WelcomeModal {...defaultProps} />)

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    })

    it('has aria-labelledby pointing to title', () => {
      render(<WelcomeModal {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby', 'welcome-modal-title')

      const title = screen.getByText('Welcome to the Eagles!')
      expect(title).toHaveAttribute('id', 'welcome-modal-title')
    })
  })

  describe('Styling', () => {
    it('renders modal with full-screen fixed overlay', () => {
      const { container } = render(<WelcomeModal {...defaultProps} />)

      const overlay = container.querySelector('.fixed.inset-0')
      expect(overlay).toBeInTheDocument()
      expect(overlay).toHaveClass('z-50')
    })

    it('renders modal content with correct styling', () => {
      render(<WelcomeModal {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveClass('rounded-lg', 'p-6')
    })

    it('has opaque backdrop to hide underlying content', () => {
      const { container } = render(<WelcomeModal {...defaultProps} />)

      const overlay = container.querySelector('.fixed.inset-0')
      expect(overlay).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0.8)' })
    })

    it('has solid opaque background on modal dialog', () => {
      render(<WelcomeModal {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      // #1e1e2a is the gridiron-bg-card color
      expect(dialog).toHaveStyle({ backgroundColor: 'rgb(30, 30, 42)' })
    })
  })
})
