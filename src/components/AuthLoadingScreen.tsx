interface AuthLoadingScreenProps {
  message?: string;
}

export function AuthLoadingScreen({ message = 'Loading...' }: AuthLoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-green-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 bg-gray-900 rounded-full"></div>
        </div>
      </div>
      <p className="mt-6 text-gray-400 text-lg">{message}</p>
    </div>
  );
}

export default AuthLoadingScreen;
