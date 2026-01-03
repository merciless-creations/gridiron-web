import { useState } from 'react';
import { useAssignGm } from '../api/teamAssignments';

interface AssignGmModalProps {
  leagueId: number;
  teamId: number;
  teamName: string;
  onClose: () => void;
}

export function AssignGmModal({ leagueId, teamId, teamName, onClose }: AssignGmModalProps) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const assignGm = useAssignGm();

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await assignGm.mutateAsync({
        leagueId,
        teamId,
        request: { email: email.trim(), displayName: displayName.trim() },
      });
      onClose();
    } catch {
      setError('Failed to assign GM. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div role="dialog" aria-modal="true" className="bg-gridiron-dark rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-bold text-gridiron-light mb-4">
          Assign GM to {teamName}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gridiron-gray text-sm mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gridiron-darker border border-gridiron-gray/30 rounded px-3 py-2 text-gridiron-light focus:outline-none focus:border-gridiron-accent"
              placeholder="gm@example.com"
            />
          </div>

          <div>
            <label className="block text-gridiron-gray text-sm mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-gridiron-darker border border-gridiron-gray/30 rounded px-3 py-2 text-gridiron-light focus:outline-none focus:border-gridiron-accent"
              placeholder="John Smith"
            />
          </div>

          <p className="text-gridiron-gray text-sm">
            ℹ️ If this email is already registered, they'll see this team on their
            dashboard. Otherwise, ask them to sign up at goaltogo.football
          </p>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
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
