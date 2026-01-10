import { useState } from 'react';
import { useAssignGm } from '../api/teamAssignments';

interface AssignGmModalProps {
  leagueId: number;
  teamId: number;
  teamName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

type ModalState = 'form' | 'success';

export function AssignGmModal({ leagueId, teamId, teamName, onClose, onSuccess }: AssignGmModalProps) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [modalState, setModalState] = useState<ModalState>('form');

  const assignGm = useAssignGm();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await assignGm.mutateAsync({
        leagueId,
        teamId,
        request: { email: email.trim(), displayName: displayName.trim() },
      });
      setModalState('success');
    } catch {
      setError('Failed to assign GM. Please try again.');
    }
  };

  const handleSuccessClose = () => {
    onSuccess?.();
    onClose();
  };

  if (modalState === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div role="dialog" aria-modal="true" aria-labelledby="success-title" className="bg-gridiron-dark rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 id="success-title" className="text-xl font-bold text-gridiron-light mb-2">
              GM Assigned Successfully
            </h2>
            <p className="text-gridiron-gray mb-6">
              {displayName} has been assigned as GM of {teamName}.
              {' '}They will see this team on their dashboard.
            </p>
            <button
              onClick={handleSuccessClose}
              className="btn-primary w-full"
              data-testid="success-close-button"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="bg-gridiron-dark rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 id="modal-title" className="text-xl font-bold text-gridiron-light mb-4">
          Assign GM to {teamName}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email-input" className="block text-gridiron-gray text-sm mb-1">
              Email Address
            </label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gridiron-darker border border-gridiron-gray/30 rounded px-3 py-2 text-gridiron-light focus:outline-none focus:border-gridiron-accent"
              placeholder="gm@example.com"
              aria-describedby={error ? 'error-message' : undefined}
            />
          </div>

          <div>
            <label htmlFor="display-name-input" className="block text-gridiron-gray text-sm mb-1">
              Display Name
            </label>
            <input
              id="display-name-input"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-gridiron-darker border border-gridiron-gray/30 rounded px-3 py-2 text-gridiron-light focus:outline-none focus:border-gridiron-accent"
              placeholder="John Smith"
            />
          </div>

          <p className="text-gridiron-gray text-sm">
            If this email is already registered, they will see this team on their
            dashboard. Otherwise, ask them to sign up at goaltogo.football
          </p>

          {error && (
            <p id="error-message" role="alert" className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={assignGm.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={assignGm.isPending}
            >
              {assignGm.isPending ? 'Assigning...' : 'Assign GM'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
