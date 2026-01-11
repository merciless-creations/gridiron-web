interface WelcomeModalProps {
  teamName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function WelcomeModal({ teamName, onConfirm, onCancel, isLoading }: WelcomeModalProps) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        className="rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-gridiron-border-subtle"
        style={{ backgroundColor: '#1e1e2a' }}
      >
        <div className="text-center">
          <span className="text-4xl mb-4 block">🏈</span>
          <h2
            id="welcome-modal-title"
            className="text-2xl font-bold text-gridiron-text-primary mb-2"
          >
            Welcome to the {teamName}!
          </h2>
        </div>

        <p className="text-gridiron-text-secondary text-center mb-6">
          You're now the GM.
        </p>

        <div className="text-gridiron-text-primary mb-6">
          <p className="mb-2">As GM, you can:</p>
          <ul className="list-disc list-inside space-y-1 text-gridiron-text-secondary">
            <li>Manage your roster</li>
            <li>Set your depth chart</li>
            <li>Make trades and signings</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn-primary flex-1"
            disabled={isLoading}
          >
            {isLoading ? 'Confirming...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
