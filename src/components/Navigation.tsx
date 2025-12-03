import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Navigation = () => {
  const { isAuthenticated, user, login, logout } = useAuth();

  return (
    <nav className="bg-gridiron-bg-secondary border-b border-gridiron-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-display font-bold text-gridiron-accent">Goal to Go</h1>
            </Link>
            <div className="hidden md:flex space-x-1">
              <Link
                to="/"
                className="px-3 py-2 rounded text-sm font-medium text-gridiron-text-secondary hover:text-gridiron-text-primary hover:bg-gridiron-bg-tertiary transition-colors"
              >
                Home
              </Link>
              <Link
                to="/teams"
                className="px-3 py-2 rounded text-sm font-medium text-gridiron-text-secondary hover:text-gridiron-text-primary hover:bg-gridiron-bg-tertiary transition-colors"
              >
                Teams
              </Link>
              <Link
                to="/leagues"
                className="px-3 py-2 rounded text-sm font-medium text-gridiron-text-secondary hover:text-gridiron-text-primary hover:bg-gridiron-bg-tertiary transition-colors"
              >
                Leagues
              </Link>
              <Link
                to="/simulate"
                className="px-3 py-2 rounded text-sm font-medium text-gridiron-text-secondary hover:text-gridiron-text-primary hover:bg-gridiron-bg-tertiary transition-colors"
              >
                Simulate Game
              </Link>
              <Link
                to="/profile"
                className="px-3 py-2 rounded text-sm font-medium text-gridiron-text-secondary hover:text-gridiron-text-primary hover:bg-gridiron-bg-tertiary transition-colors"
              >
                Profile
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gridiron-text-secondary">
                  {user?.name || user?.username || 'User'}
                </span>
                <button
                  onClick={logout}
                  className="btn-secondary text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={login}
                className="btn-primary text-sm"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
