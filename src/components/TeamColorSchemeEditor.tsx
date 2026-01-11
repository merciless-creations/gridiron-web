import { useState, useCallback } from 'react';
import { usePreferences } from '../contexts';
import type { TeamColorScheme } from '../types/Preferences';

interface TeamColorSchemeEditorProps {
  /** The team ID to edit colors for */
  teamId: number;
  /** Team name for display */
  teamName: string;
  /** Default colors to show when user hasn't set custom colors */
  defaultColors?: TeamColorScheme;
  /** Callback when colors are saved */
  onSave?: (colors: TeamColorScheme) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Preview component showing how the colors look
 */
function ColorPreview({ colors, teamName }: { colors: TeamColorScheme; teamName: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-gridiron-border-subtle">
      <div
        className="w-16 h-16 rounded-lg flex items-center justify-center text-xl font-bold"
        style={{
          backgroundColor: colors.primary,
          color: colors.secondary,
        }}
        data-testid="color-preview"
      >
        {teamName.substring(0, 2).toUpperCase()}
      </div>
      <div className="flex-1">
        <div
          className="font-semibold text-lg mb-1"
          style={{ color: colors.primary }}
        >
          {teamName}
        </div>
        <div className="flex gap-2">
          <span
            className="px-2 py-0.5 rounded text-xs font-medium"
            style={{
              backgroundColor: colors.primary,
              color: colors.secondary,
            }}
          >
            Primary
          </span>
          <span
            className="px-2 py-0.5 rounded text-xs font-medium"
            style={{
              backgroundColor: colors.secondary,
              color: colors.primary,
            }}
          >
            Secondary
          </span>
          {colors.accent && (
            <span
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{
                backgroundColor: colors.accent,
                color: colors.primary,
              }}
            >
              Accent
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Color input with preview
 */
function ColorInput({
  label,
  value,
  onChange,
  testId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  testId: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-gridiron-text-secondary w-24">{label}</label>
      <div className="flex items-center gap-2 flex-1">
        <div
          className="w-8 h-8 rounded-lg border-2 border-gridiron-border-subtle"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-8 rounded cursor-pointer"
          aria-label={`${label} color picker`}
          data-testid={`${testId}-picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#RRGGBB"
          className="flex-1 input-field font-mono text-sm"
          pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
          aria-label={`${label} hex value`}
          data-testid={`${testId}-hex`}
        />
      </div>
    </div>
  );
}

/**
 * Component for editing team color schemes
 */
export function TeamColorSchemeEditor({
  teamId,
  teamName,
  defaultColors = { primary: '#00d4aa', secondary: '#1a1a24' },
  onSave,
  className = '',
}: TeamColorSchemeEditorProps) {
  const { getTeamColorScheme, setTeamColorScheme, removeTeamColorScheme, isSaving } = usePreferences();

  // Get current colors (user-set or defaults)
  const currentColors = getTeamColorScheme(teamId) ?? defaultColors;

  // Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editColors, setEditColors] = useState<TeamColorScheme>(currentColors);

  const handleStartEdit = useCallback(() => {
    setEditColors(currentColors);
    setIsEditing(true);
  }, [currentColors]);

  const handleCancel = useCallback(() => {
    setEditColors(currentColors);
    setIsEditing(false);
  }, [currentColors]);

  const handleSave = useCallback(async () => {
    await setTeamColorScheme(teamId, editColors);
    onSave?.(editColors);
    setIsEditing(false);
  }, [teamId, editColors, setTeamColorScheme, onSave]);

  const handleReset = useCallback(async () => {
    await removeTeamColorScheme(teamId);
    setEditColors(defaultColors);
    setIsEditing(false);
  }, [teamId, defaultColors, removeTeamColorScheme]);

  return (
    <div className={`card ${className}`} data-testid="team-color-editor">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gridiron-text-primary">
          Team Colors
        </h3>
        {!isEditing && (
          <button
            onClick={handleStartEdit}
            className="btn-secondary text-sm"
            data-testid="edit-colors-button"
          >
            Customize
          </button>
        )}
      </div>

      {/* Preview */}
      <ColorPreview colors={isEditing ? editColors : currentColors} teamName={teamName} />

      {/* Editor */}
      {isEditing && (
        <div className="mt-4 space-y-4">
          <ColorInput
            label="Primary"
            value={editColors.primary}
            onChange={(primary) => setEditColors(prev => ({ ...prev, primary }))}
            testId="primary-color"
          />
          <ColorInput
            label="Secondary"
            value={editColors.secondary}
            onChange={(secondary) => setEditColors(prev => ({ ...prev, secondary }))}
            testId="secondary-color"
          />
          <ColorInput
            label="Accent"
            value={editColors.accent ?? editColors.primary}
            onChange={(accent) => setEditColors(prev => ({ ...prev, accent }))}
            testId="accent-color"
          />

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gridiron-border-subtle">
            <button
              onClick={handleReset}
              className="text-sm text-gridiron-text-muted hover:text-gridiron-text-secondary"
              data-testid="reset-colors-button"
            >
              Reset to default
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="btn-secondary text-sm"
                data-testid="cancel-colors-button"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary text-sm"
                data-testid="save-colors-button"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamColorSchemeEditor;
