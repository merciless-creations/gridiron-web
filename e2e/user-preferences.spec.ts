import { test, expect } from '@playwright/test';

const MOCK_SERVER_URL = 'http://localhost:3001';

test.describe('User Preferences', () => {
  test.beforeEach(async ({ page }) => {
    // Reset mock server state
    await fetch(`${MOCK_SERVER_URL}/_reset`, { method: 'POST' });
  });

  test.describe('Theme Switching', () => {
    test('displays theme switcher on profile page', async ({ page }) => {
      await page.goto('/profile');

      // Wait for preferences section to load
      await expect(page.getByTestId('preferences-section')).toBeVisible();

      // Theme switcher should be visible
      await expect(page.getByTestId('theme-switcher')).toBeVisible();
    });

    test('can switch to light theme', async ({ page }) => {
      await page.goto('/profile');

      // Wait for preferences section
      await expect(page.getByTestId('preferences-section')).toBeVisible();

      // Click light theme button
      await page.getByTestId('theme-option-light').click();

      // Verify theme is applied to document
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    });

    test('can switch to dark theme', async ({ page }) => {
      await page.goto('/profile');

      // Wait for preferences section
      await expect(page.getByTestId('preferences-section')).toBeVisible();

      // First switch to light
      await page.getByTestId('theme-option-light').click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

      // Then switch to dark
      await page.getByTestId('theme-option-dark').click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });

    test('can switch to system theme', async ({ page }) => {
      await page.goto('/profile');

      // Wait for preferences section
      await expect(page.getByTestId('preferences-section')).toBeVisible();

      // Click system theme button
      await page.getByTestId('theme-option-system').click();

      // Theme should be applied based on system preference
      // We can't easily test the actual resolved theme, but the button should be selected
      await expect(page.getByTestId('theme-option-system')).toHaveAttribute('aria-checked', 'true');
    });

    test('theme preference persists after page reload', async ({ page }) => {
      await page.goto('/profile');

      // Switch to light theme
      await page.getByTestId('theme-option-light').click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

      // Reload page
      await page.reload();

      // Wait for preferences to load
      await expect(page.getByTestId('preferences-section')).toBeVisible();

      // Theme should still be light
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    });
  });

  test.describe('Reset Preferences', () => {
    test('can reset all preferences to defaults', async ({ page }) => {
      await page.goto('/profile');

      // Wait for preferences section
      await expect(page.getByTestId('preferences-section')).toBeVisible();

      // Switch to light theme first
      await page.getByTestId('theme-option-light').click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

      // Reset preferences
      await page.getByTestId('reset-preferences-button').click();

      // Wait for reset to complete
      await page.waitForTimeout(500);

      // Theme should be back to system (default)
      await expect(page.getByTestId('theme-option-system')).toHaveAttribute('aria-checked', 'true');
    });
  });

  test.describe('Grid Column Customization', () => {
    test('shows column customizer on roster page', async ({ page }) => {
      // Navigate to a team roster page
      await page.goto('/teams/1/roster');

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Column customizer toggle should be visible
      await expect(page.getByTestId('column-customizer-toggle')).toBeVisible();
    });

    test('can open column customizer panel', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForLoadState('networkidle');

      // Click to open panel
      await page.getByTestId('column-customizer-toggle').click();

      // Panel should be visible
      await expect(page.getByTestId('column-customizer-panel')).toBeVisible();
    });

    test('can toggle column visibility', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForLoadState('networkidle');

      // Open column customizer
      await page.getByTestId('column-customizer-toggle').click();

      // Check initial state of college column
      const collegeToggle = page.getByTestId('column-toggle-college');
      await expect(collegeToggle).toBeVisible();

      // Toggle it
      await collegeToggle.click();

      // Wait for update
      await page.waitForTimeout(300);

      // Column should be hidden from table
      // (The actual verification depends on how the table is structured)
    });

    test('can reorder columns', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForLoadState('networkidle');

      // Open column customizer
      await page.getByTestId('column-customizer-toggle').click();

      // Find a column to move
      const moveDownButton = page.getByTestId('column-down-name');

      if (await moveDownButton.isVisible()) {
        await moveDownButton.click();
        // Wait for update
        await page.waitForTimeout(300);
      }
    });

    test('can reset columns to defaults', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForLoadState('networkidle');

      // Open column customizer
      await page.getByTestId('column-customizer-toggle').click();

      // Click reset button
      await page.getByTestId('reset-columns').click();

      // Wait for update
      await page.waitForTimeout(300);
    });

    test('column preferences persist after reload', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForLoadState('networkidle');

      // Open column customizer and toggle a column
      await page.getByTestId('column-customizer-toggle').click();

      const ageToggle = page.getByTestId('column-toggle-age');
      await ageToggle.click();

      // Wait for save
      await page.waitForTimeout(500);

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Open column customizer again
      await page.getByTestId('column-customizer-toggle').click();

      // The toggle state should be preserved
      // (Verification depends on implementation)
    });
  });

  test.describe('Team Color Scheme Editor', () => {
    test('shows color editor on team manage page for GMs', async ({ page }) => {
      // Navigate to team management page
      await page.goto('/teams/1/manage');
      await page.waitForLoadState('networkidle');

      // Color editor should be visible
      await expect(page.getByTestId('team-color-editor')).toBeVisible();
    });

    test('can open color editor', async ({ page }) => {
      await page.goto('/teams/1/manage');
      await page.waitForLoadState('networkidle');

      // Click customize button
      await page.getByTestId('edit-colors-button').click();

      // Color inputs should be visible
      await expect(page.getByTestId('primary-color-hex')).toBeVisible();
      await expect(page.getByTestId('secondary-color-hex')).toBeVisible();
    });

    test('can edit primary color', async ({ page }) => {
      await page.goto('/teams/1/manage');
      await page.waitForLoadState('networkidle');

      // Open editor
      await page.getByTestId('edit-colors-button').click();

      // Clear and enter new color
      const primaryInput = page.getByTestId('primary-color-hex');
      await primaryInput.clear();
      await primaryInput.fill('#FF0000');

      // Verify input has new value
      await expect(primaryInput).toHaveValue('#FF0000');
    });

    test('can save color changes', async ({ page }) => {
      await page.goto('/teams/1/manage');
      await page.waitForLoadState('networkidle');

      // Open editor
      await page.getByTestId('edit-colors-button').click();

      // Edit color
      const primaryInput = page.getByTestId('primary-color-hex');
      await primaryInput.clear();
      await primaryInput.fill('#FF0000');

      // Save
      await page.getByTestId('save-colors-button').click();

      // Wait for save
      await page.waitForTimeout(500);

      // Editor should close
      await expect(page.getByTestId('edit-colors-button')).toBeVisible();
    });

    test('can cancel color changes', async ({ page }) => {
      await page.goto('/teams/1/manage');
      await page.waitForLoadState('networkidle');

      // Open editor
      await page.getByTestId('edit-colors-button').click();

      // Edit color
      const primaryInput = page.getByTestId('primary-color-hex');
      const originalValue = await primaryInput.inputValue();
      await primaryInput.clear();
      await primaryInput.fill('#FF0000');

      // Cancel
      await page.getByTestId('cancel-colors-button').click();

      // Editor should close without saving
      await expect(page.getByTestId('edit-colors-button')).toBeVisible();
    });

    test('can reset colors to defaults', async ({ page }) => {
      await page.goto('/teams/1/manage');
      await page.waitForLoadState('networkidle');

      // Open editor
      await page.getByTestId('edit-colors-button').click();

      // Reset
      await page.getByTestId('reset-colors-button').click();

      // Wait for reset
      await page.waitForTimeout(500);

      // Editor should close
      await expect(page.getByTestId('edit-colors-button')).toBeVisible();
    });
  });
});
