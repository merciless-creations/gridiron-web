import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { ContextSwitcher } from './ContextSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';

interface UserAvatarMenuProps {
  className?: string;
}

/**
 * Get initials from user name or username
 */
const getInitials = (name?: string, username?: string): string => {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (username) {
    // Handle email usernames - take first part
    const namePart = username.split('@')[0];
    return namePart.slice(0, 2).toUpperCase();
  }
  return 'U';
};

export const UserAvatarMenu = ({ className = '' }: UserAvatarMenuProps) => {
  const { isAuthenticated, user, login, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // If not authenticated, show login button
  if (!isAuthenticated) {
    return (
      <button
        onClick={login}
        className={`btn-primary text-sm ${className}`}
        data-testid="login-button"
      >
        Login
      </button>
    );
  }

  const initials = getInitials(user?.name, user?.username);
  const displayName = user?.name || user?.username || 'User';

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* Avatar Pill Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-gridiron-bg-tertiary hover:bg-gridiron-border-subtle border border-gridiron-border-subtle transition-colors"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`User menu for ${displayName}`}
        data-testid="user-avatar-menu-trigger"
      >
        {/* Avatar Circle with Initials */}
        <div
          className="w-8 h-8 rounded-full bg-gridiron-accent flex items-center justify-center text-sm font-semibold text-gridiron-bg-primary"
          data-testid="user-avatar-initials"
        >
          {initials}
        </div>
        {/* Name - hidden on mobile */}
        <span
          className="hidden sm:block text-sm text-gridiron-text-primary font-medium max-w-[120px] truncate"
          data-testid="user-avatar-name"
        >
          {displayName}
        </span>
        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gridiron-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-1 w-72 sm:w-80 max-h-[calc(100vh-5rem)] overflow-auto bg-gridiron-bg-card border border-gridiron-border-subtle rounded shadow-lg z-50"
          role="menu"
          data-testid="user-avatar-menu-dropdown"
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gridiron-border-subtle">
            <div className="font-medium text-gridiron-text-primary">{displayName}</div>
            {user?.email && user.email !== displayName && (
              <div className="text-sm text-gridiron-text-muted truncate">{user.email}</div>
            )}
          </div>

          {/* Profile Link */}
          <Link
            to="/profile"
            onClick={closeMenu}
            className="flex items-center gap-3 px-4 py-3 text-sm text-gridiron-text-primary hover:bg-gridiron-bg-tertiary transition-colors"
            role="menuitem"
            data-testid="avatar-menu-profile-link"
          >
            <svg className="w-5 h-5 text-gridiron-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </Link>

          {/* Theme Switcher */}
          <div className="px-4 py-2 flex items-center justify-between" role="menuitem">
            <span className="text-sm text-gridiron-text-secondary">Theme</span>
            <ThemeSwitcher variant="buttons" className="scale-90" data-testid="avatar-menu-theme-switcher" />
          </div>

          {/* Divider */}
          <div className="border-t border-gridiron-border-subtle" />

          {/* Context Switcher Section */}
          <div className="py-2" role="group" aria-label="League and team selection">
            <div className="px-4 py-1.5 text-xs font-semibold text-gridiron-text-muted uppercase tracking-wider">
              Switch Context
            </div>
            <ContextSwitcher embedded onSelect={closeMenu} />
          </div>

          {/* Divider */}
          <div className="border-t border-gridiron-border-subtle" />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            role="menuitem"
            data-testid="avatar-menu-logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
