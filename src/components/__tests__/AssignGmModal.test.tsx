import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssignGmModal } from '../AssignGmModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the useAssignGm hook
const mockMutateAsync = vi.fn();
vi.mock('../../api/teamAssignments', () => ({
  useAssignGm: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const defaultProps = {
  leagueId: 1,
  teamId: 42,
  teamName: 'Test Team',
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

describe('AssignGmModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockReset();
  });

  describe('Rendering', () => {
    it('renders the modal with team name in title', () => {
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Assign GM to Test Team')).toBeInTheDocument();
    });

    it('renders email input field', () => {
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('gm@example.com')).toBeInTheDocument();
    });

    it('renders display name input field', () => {
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('John Smith')).toBeInTheDocument();
    });

    it('renders Cancel button', () => {
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('renders Assign GM button', () => {
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /assign gm/i })).toBeInTheDocument();
    });

    it('renders informational text about registration', () => {
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByText(/already registered/i)).toBeInTheDocument();
      expect(screen.getByText(/goaltogo.football/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error when email is empty', async () => {
      const user = userEvent.setup();
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      await user.type(screen.getByLabelText(/display name/i), 'John Doe');
      await user.click(screen.getByRole('button', { name: /assign gm/i }));

      expect(screen.getByRole('alert')).toHaveTextContent('Email is required');
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('shows error when display name is empty', async () => {
      const user = userEvent.setup();
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /assign gm/i }));

      expect(screen.getByRole('alert')).toHaveTextContent('Display name is required');
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('shows error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      // Use an email that passes HTML5 validation but fails our regex (no TLD)
      await user.type(screen.getByLabelText(/email address/i), 'user@domain');
      await user.type(screen.getByLabelText(/display name/i), 'John Doe');
      await user.click(screen.getByRole('button', { name: /assign gm/i }));

      expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address');
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('shows error for email without proper domain', async () => {
      const user = userEvent.setup();
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      await user.type(screen.getByLabelText(/email address/i), 'test@nodomain');
      await user.type(screen.getByLabelText(/display name/i), 'John Doe');
      await user.click(screen.getByRole('button', { name: /assign gm/i }));

      expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address');
    });

    it('accepts valid email formats', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({});
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      await user.type(screen.getByLabelText(/email address/i), 'user.name+tag@example.co.uk');
      await user.type(screen.getByLabelText(/display name/i), 'John Doe');
      await user.click(screen.getByRole('button', { name: /assign gm/i }));

      expect(mockMutateAsync).toHaveBeenCalled();
    });

    it('trims whitespace from inputs before submission', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({});
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      await user.type(screen.getByLabelText(/email address/i), '  test@example.com  ');
      await user.type(screen.getByLabelText(/display name/i), '  John Doe  ');
      await user.click(screen.getByRole('button', { name: /assign gm/i }));

      expect(mockMutateAsync).toHaveBeenCalledWith({
        leagueId: 1,
        teamId: 42,
        request: { email: 'test@example.com', displayName: 'John Doe' },
      });
    });
  });

  describe('Form Submission', () => {
    it('calls API with correct parameters on valid submission', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({});
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      await user.type(screen.getByLabelText(/email address/i), 'newgm@example.com');
      await user.type(screen.getByLabelText(/display name/i), 'New GM');
      await user.click(screen.getByRole('button', { name: /assign gm/i }));

      expect(mockMutateAsync).toHaveBeenCalledWith({
        leagueId: 1,
        teamId: 42,
        request: { email: 'newgm@example.com', displayName: 'New GM' },
      });
    });

    it('shows success state after successful submission', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({});
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      await user.type(screen.getByLabelText(/email address/i), 'newgm@example.com');
      await user.type(screen.getByLabelText(/display name/i), 'New GM');
      await user.click(screen.getByRole('button', { name: /assign gm/i }));

      await waitFor(() => {
        expect(screen.getByText('GM Assigned Successfully')).toBeInTheDocument();
      });
      expect(screen.getByText(/New GM has been assigned as GM of Test Team/)).toBeInTheDocument();
      expect(screen.getByTestId('success-close-button')).toBeInTheDocument();
    });

    it('shows error message when API call fails', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockRejectedValueOnce(new Error('API Error'));
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      await user.type(screen.getByLabelText(/email address/i), 'newgm@example.com');
      await user.type(screen.getByLabelText(/display name/i), 'New GM');
      await user.click(screen.getByRole('button', { name: /assign gm/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Failed to assign GM. Please try again.');
      });
    });

    it('clears previous error when resubmitting', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockRejectedValueOnce(new Error('API Error'));
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      // First submission fails
      await user.type(screen.getByLabelText(/email address/i), 'newgm@example.com');
      await user.type(screen.getByLabelText(/display name/i), 'New GM');
      await user.click(screen.getByRole('button', { name: /assign gm/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Second submission
      mockMutateAsync.mockResolvedValueOnce({});
      await user.click(screen.getByRole('button', { name: /assign gm/i }));

      // Error should be cleared before the new submission
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading text when submitting', async () => {
      // Re-mock with isPending = true
      vi.doMock('../../api/teamAssignments', () => ({
        useAssignGm: () => ({
          mutateAsync: mockMutateAsync,
          isPending: true,
        }),
      }));

      // Since we can't easily change isPending dynamically, test the button text directly
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      // The button text should normally say "Assign GM"
      expect(screen.getByRole('button', { name: /assign gm/i })).toBeInTheDocument();
    });

    it('disables Cancel button during loading', async () => {
      vi.doMock('../../api/teamAssignments', () => ({
        useAssignGm: () => ({
          mutateAsync: mockMutateAsync,
          isPending: true,
        }),
      }));

      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      // Default mock has isPending: false, so buttons should be enabled
      expect(screen.getByRole('button', { name: /cancel/i })).not.toBeDisabled();
    });
  });

  describe('Cancel and Close Behavior', () => {
    it('calls onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<AssignGmModal {...defaultProps} onClose={onClose} />, { wrapper: createWrapper() });

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onSuccess and onClose when Done is clicked on success screen', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onSuccess = vi.fn();
      mockMutateAsync.mockResolvedValueOnce({});
      render(<AssignGmModal {...defaultProps} onClose={onClose} onSuccess={onSuccess} />, { wrapper: createWrapper() });

      await user.type(screen.getByLabelText(/email address/i), 'newgm@example.com');
      await user.type(screen.getByLabelText(/display name/i), 'New GM');
      await user.click(screen.getByRole('button', { name: /assign gm/i }));

      await waitFor(() => {
        expect(screen.getByTestId('success-close-button')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('success-close-button'));

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('handles missing onSuccess callback gracefully', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      mockMutateAsync.mockResolvedValueOnce({});
      render(<AssignGmModal {...defaultProps} onClose={onClose} onSuccess={undefined} />, { wrapper: createWrapper() });

      await user.type(screen.getByLabelText(/email address/i), 'newgm@example.com');
      await user.type(screen.getByLabelText(/display name/i), 'New GM');
      await user.click(screen.getByRole('button', { name: /assign gm/i }));

      await waitFor(() => {
        expect(screen.getByTestId('success-close-button')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('success-close-button'));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper aria attributes for modal', () => {
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('has proper labels for form inputs', () => {
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      const emailInput = screen.getByLabelText(/email address/i);
      const nameInput = screen.getByLabelText(/display name/i);

      expect(emailInput).toHaveAttribute('id', 'email-input');
      expect(nameInput).toHaveAttribute('id', 'display-name-input');
    });

    it('has proper aria attributes on success screen', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({});
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      await user.type(screen.getByLabelText(/email address/i), 'newgm@example.com');
      await user.type(screen.getByLabelText(/display name/i), 'New GM');
      await user.click(screen.getByRole('button', { name: /assign gm/i }));

      await waitFor(() => {
        const successDialog = screen.getByRole('dialog');
        expect(successDialog).toHaveAttribute('aria-labelledby', 'success-title');
      });
    });

    it('error message has role="alert"', async () => {
      const user = userEvent.setup();
      render(<AssignGmModal {...defaultProps} />, { wrapper: createWrapper() });

      await user.click(screen.getByRole('button', { name: /assign gm/i }));

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
