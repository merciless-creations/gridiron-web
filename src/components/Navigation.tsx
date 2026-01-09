import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ContextSwitcher } from './ContextSwitcher';

export const Navigation = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gridiron-bg-secondary border-b border-gridiron-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4 lg:space-x-8">
            <Link to="/" className="flex items-center flex-shrink-0">
              <h1 className="text-xl sm:text-2xl font-display font-bold text-gridiron-accent">Goal to Go</h1>
            </Link>

            {/* Context Switcher - visible when authenticated */}
            {isAuthenticated && (
              <ContextSwitcher className="hidden sm:block" />
            )}

            <div className="hidden lg:flex space-x-1">
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
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded text-gridiron-text-secondary hover:text-gridiron-text-primary hover:bg-gridiron-bg-tertiary transition-colors"
              aria-label="Toggle menu"
              data-testid="mobile-menu-button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {isAuthenticated ? (
              <>
                <span className="hidden sm:block text-sm text-gridiron-text-secondary">
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

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-4 space-y-2" data-testid="mobile-menu">
            {/* Context Switcher for mobile */}
            {isAuthenticated && (
              <div className="sm:hidden py-2">
                <ContextSwitcher />
              </div>
            )}

            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded text-sm font-medium text-gridiron-text-secondary hover:text-gridiron-text-primary hover:bg-gridiron-bg-tertiary transition-colors"
            >
              Home
            </Link>
            <Link
              to="/teams"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded text-sm font-medium text-gridiron-text-secondary hover:text-gridiron-text-primary hover:bg-gridiron-bg-tertiary transition-colors"
            >
              Teams
            </Link>
            <Link
              to="/leagues"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded text-sm font-medium text-gridiron-text-secondary hover:text-gridiron-text-primary hover:bg-gridiron-bg-tertiary transition-colors"
            >
              Leagues
            </Link>
            <Link
              to="/simulate"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded text-sm font-medium text-gridiron-text-secondary hover:text-gridiron-text-primary hover:bg-gridiron-bg-tertiary transition-colors"
            >
              Simulate Game
            </Link>
            <Link
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded text-sm font-medium text-gridiron-text-secondary hover:text-gridiron-text-primary hover:bg-gridiron-bg-tertiary transition-colors"
            >
              Profile
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
