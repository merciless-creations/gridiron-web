interface WelcomeModalProps {
  teamName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function WelcomeModal({ teamName, onConfirm, onCancel, isLoading }: WelcomeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        className="bg-gridiron-dark rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
      >
        <div className="text-center">
          <span className="text-4xl mb-4 block">🏈</span>
          <h2
            id="welcome-modal-title"
            className="text-2xl font-bold text-gridiron-light mb-2"
          >
            Welcome to the {teamName}!
          </h2>
        </div>

        <p className="text-gridiron-gray text-center mb-6">
          You're now the GM.
        </p>

        <div className="text-gridiron-light mb-6">
          <p className="mb-2">As GM, you can:</p>
          <ul className="list-disc list-inside space-y-1 text-gridiron-gray">
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
