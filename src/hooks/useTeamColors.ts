import { useCallback, useRef } from 'react';
import type { TeamColorScheme } from '../types/Preferences';

/**
 * CSS custom properties used for team colors throughout the site
 */
const TEAM_COLOR_VARS = {
  primary: '--team-color-primary',
  secondary: '--team-color-secondary',
  accent: '--team-color-accent',
} as const;

/**
 * Default team colors (matches the gridiron theme)
 */
const DEFAULT_COLORS: TeamColorScheme = {
  primary: '#00d4aa',
  secondary: '#1a1a24',
  accent: '#00d4aa',
};

/**
 * Hook for managing team colors as CSS custom properties
 *
 * Provides:
 * - Live application of colors to the entire site
 * - Rollback mechanism for cancel operations
 * - Automatic cleanup
 */
export function useTeamColors() {
  const rollbackColorsRef = useRef<TeamColorScheme | null>(null);

  /**
   * Apply team colors to CSS custom properties on :root
   */
  const applyColors = useCallback((colors: TeamColorScheme) => {
    const root = document.documentElement;
    root.style.setProperty(TEAM_COLOR_VARS.primary, colors.primary);
    root.style.setProperty(TEAM_COLOR_VARS.secondary, colors.secondary);
    root.style.setProperty(TEAM_COLOR_VARS.accent, colors.accent ?? colors.primary);
  }, []);

  /**
   * Get the current colors from CSS custom properties
   */
  const getCurrentColors = useCallback((): TeamColorScheme => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    return {
      primary: styles.getPropertyValue(TEAM_COLOR_VARS.primary).trim() || DEFAULT_COLORS.primary,
      secondary: styles.getPropertyValue(TEAM_COLOR_VARS.secondary).trim() || DEFAULT_COLORS.secondary,
      accent: styles.getPropertyValue(TEAM_COLOR_VARS.accent).trim() || DEFAULT_COLORS.accent,
    };
  }, []);

  /**
   * Store current colors as rollback point before editing
   */
  const storeRollbackPoint = useCallback(() => {
    rollbackColorsRef.current = getCurrentColors();
  }, [getCurrentColors]);

  /**
   * Revert to the stored rollback point
   */
  const revertColors = useCallback(() => {
    if (rollbackColorsRef.current) {
      applyColors(rollbackColorsRef.current);
      rollbackColorsRef.current = null;
    }
  }, [applyColors]);

  /**
   * Clear the rollback point (call after successful save)
   */
  const clearRollbackPoint = useCallback(() => {
    rollbackColorsRef.current = null;
  }, []);

  /**
   * Reset to default colors
   */
  const resetToDefault = useCallback(() => {
    applyColors(DEFAULT_COLORS);
  }, [applyColors]);

  return {
    applyColors,
    getCurrentColors,
    storeRollbackPoint,
    revertColors,
    clearRollbackPoint,
    resetToDefault,
    DEFAULT_COLORS,
  };
}

export { TEAM_COLOR_VARS, DEFAULT_COLORS };
