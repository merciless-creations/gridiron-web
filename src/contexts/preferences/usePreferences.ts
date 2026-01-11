import { useContext } from 'react';
import { PreferencesContext } from './PreferencesContext';
import type { PreferencesContextValue } from './types';

/**
 * Hook to access user preferences
 * Must be used within a PreferencesProvider
 */
export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);

  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }

  return context;
}
