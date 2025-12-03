interface ErrorMessageProps {
  message?: string;
}

export const ErrorMessage = ({ message = 'An error occurred' }: ErrorMessageProps) => {
  return (
    <div className="bg-gridiron-loss/10 border border-gridiron-loss/30 rounded p-4 my-4">
      <div className="flex items-center">
        <svg
          className="w-5 h-5 text-gridiron-loss mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-sm text-gridiron-loss font-medium">{message}</p>
      </div>
    </div>
  );
};
