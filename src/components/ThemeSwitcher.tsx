import { usePreferences } from '../contexts';
import type { ThemePreference } from '../types/Preferences';

interface ThemeOption {
  value: ThemePreference;
  label: string;
  icon: React.ReactNode;
}

const themeOptions: ThemeOption[] = [
  {
    value: 'light',
    label: 'Light',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    ),
  },
  {
    value: 'system',
    label: 'System',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

interface ThemeSwitcherProps {
  /** Variant of the switcher */
  variant?: 'buttons' | 'dropdown' | 'compact';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Theme switcher component allowing users to select light, dark, or system theme
 */
export function ThemeSwitcher({ variant = 'buttons', className = '' }: ThemeSwitcherProps) {
  const { preferences, setTheme, isSaving } = usePreferences();
  const currentTheme = preferences.ui?.theme ?? 'system';

  if (variant === 'compact') {
    return (
      <button
        onClick={() => {
          // Cycle through themes: light -> dark -> system -> light
          const nextTheme: ThemePreference =
            currentTheme === 'light' ? 'dark' :
            currentTheme === 'dark' ? 'system' : 'light';
          setTheme(nextTheme);
        }}
        disabled={isSaving}
        className={`p-2 rounded-lg bg-gridiron-bg-tertiary hover:bg-gridiron-border-emphasis transition-colors ${className}`}
        aria-label={`Current theme: ${currentTheme}. Click to change.`}
        data-testid="theme-switcher-compact"
      >
        {themeOptions.find(o => o.value === currentTheme)?.icon}
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <select
        value={currentTheme}
        onChange={(e) => setTheme(e.target.value as ThemePreference)}
        disabled={isSaving}
        className={`select-field ${className}`}
        aria-label="Select theme"
        data-testid="theme-switcher-dropdown"
      >
        {themeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  // Default: buttons variant
  return (
    <div
      className={`inline-flex rounded-lg bg-gridiron-bg-tertiary p-1 ${className}`}
      role="radiogroup"
      aria-label="Theme selection"
      data-testid="theme-switcher"
    >
      {themeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value)}
          disabled={isSaving}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${currentTheme === option.value
              ? 'bg-gridiron-accent text-gridiron-bg-primary'
              : 'text-gridiron-text-secondary hover:text-gridiron-text-primary'
            }
          `}
          role="radio"
          aria-checked={currentTheme === option.value}
          aria-label={option.label}
          data-testid={`theme-option-${option.value}`}
        >
          {option.icon}
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

export default ThemeSwitcher;
