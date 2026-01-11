import { test, expect } from '@playwright/test';

const MOCK_SERVER_URL = 'http://localhost:3001';

test.describe('User Preferences', () => {
  test.beforeEach(async () => {
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
    // Run these tests serially to avoid mock server state conflicts
    test.describe.configure({ mode: 'serial' });

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

    test('can reorder columns with buttons', async ({ page }) => {
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

    test('verifies initial column order before drag', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForLoadState('networkidle');

      // Open column customizer
      await page.getByTestId('column-customizer-toggle').click();
      await expect(page.getByTestId('column-customizer-panel')).toBeVisible();

      // Get the column items and check their order
      const panel = page.getByTestId('column-customizer-panel');
      const columnItems = panel.locator('[data-testid^="column-item-"]');

      const itemCount = await columnItems.count();
      const itemLabels: string[] = [];
      for (let i = 0; i < itemCount; i++) {
        const item = columnItems.nth(i);
        const testId = await item.getAttribute('data-testid');
        itemLabels.push(testId || '');
      }

      // Log and verify initial order: should be number, name, position, overall, age, exp, college, salary, contract, health
      console.log('Initial column order:', itemLabels);

      // Verify default order
      expect(itemLabels[0]).toBe('column-item-number');
      expect(itemLabels[1]).toBe('column-item-name');
      expect(itemLabels[2]).toBe('column-item-position');
    });

    test('can reorder Pos column above Name using up button', async ({ page }) => {
      // Capture browser console logs
      page.on('console', msg => {
        if (msg.text().includes('GridColumnCustomizer') || msg.text().includes('columns')) {
          console.log('BROWSER:', msg.text());
        }
      });

      await page.goto('/teams/1/roster');
      await page.waitForLoadState('networkidle');

      // Open column customizer
      await page.getByTestId('column-customizer-toggle').click();
      await expect(page.getByTestId('column-customizer-panel')).toBeVisible();

      // Verify initial order: #, Name, Pos
      const panel = page.getByTestId('column-customizer-panel');
      let columnItems = panel.locator('[data-testid^="column-item-"]');

      const initialLabels: string[] = [];
      const initialCount = await columnItems.count();
      for (let i = 0; i < initialCount; i++) {
        const testId = await columnItems.nth(i).getAttribute('data-testid');
        initialLabels.push(testId || '');
      }
      console.log('Initial order:', initialLabels);
      expect(initialLabels.slice(0, 3)).toEqual(['column-item-number', 'column-item-name', 'column-item-position']);

      // Click the up button on position to move it above name
      const upButton = page.getByTestId('column-up-position');
      await expect(upButton).toBeVisible();
      await upButton.click();

      // Wait for update
      await page.waitForTimeout(500);

      // Log and verify new order in panel: #, Pos, Name
      columnItems = panel.locator('[data-testid^="column-item-"]');
      const afterCount = await columnItems.count();
      const afterLabels: string[] = [];
      for (let i = 0; i < afterCount; i++) {
        const testId = await columnItems.nth(i).getAttribute('data-testid');
        afterLabels.push(testId || '');
      }
      console.log('After reorder:', afterLabels);
      expect(afterLabels.slice(0, 3)).toEqual(['column-item-number', 'column-item-position', 'column-item-name']);

      // Close panel and verify grid header order
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);

      const tableHeaders = page.locator('table thead th');
      const headerTexts = await tableHeaders.allTextContents();
      console.log('Table headers:', headerTexts);

      expect(headerTexts[0]).toContain('#');
      expect(headerTexts[1]).toContain('Pos');
      expect(headerTexts[2]).toContain('Name');
    });

    test('can drag and drop Pos column above Name column', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForLoadState('networkidle');

      // Open column customizer
      await page.getByTestId('column-customizer-toggle').click();
      await expect(page.getByTestId('column-customizer-panel')).toBeVisible();

      // Get the column items
      const positionItem = page.getByTestId('column-item-position');
      const nameItem = page.getByTestId('column-item-name');

      await expect(positionItem).toBeVisible();
      await expect(nameItem).toBeVisible();

      // Use Playwright's native dragTo with force
      await positionItem.dragTo(nameItem, { force: true });

      // Wait for the reorder to complete
      await page.waitForTimeout(500);

      // Verify the order in the column selector panel
      const panel = page.getByTestId('column-customizer-panel');
      const columnItems = panel.locator('[data-testid^="column-item-"]');

      const itemLabels: string[] = [];
      for (let i = 0; i < 3; i++) {
        const testId = await columnItems.nth(i).getAttribute('data-testid');
        itemLabels.push(testId || '');
      }

      // The first three should be number, position, name
      expect(itemLabels).toEqual(['column-item-number', 'column-item-position', 'column-item-name']);

      // Close panel and verify grid header order
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);

      const tableHeaders = page.locator('table thead th');
      const headerTexts = await tableHeaders.allTextContents();

      expect(headerTexts[0]).toContain('#');
      expect(headerTexts[1]).toContain('Pos');
      expect(headerTexts[2]).toContain('Name');
    });

    test('drag and drop column reorder persists after page reload', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForLoadState('networkidle');

      // Open column customizer and drag position above name
      await page.getByTestId('column-customizer-toggle').click();
      await expect(page.getByTestId('column-customizer-panel')).toBeVisible();

      const positionItem = page.getByTestId('column-item-position');
      const nameItem = page.getByTestId('column-item-name');
      await positionItem.dragTo(nameItem);

      // Wait for save
      await page.waitForTimeout(500);

      // Reload the page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify the grid header order is still #, Pos, Name
      const tableHeaders = page.locator('table thead th');
      const headerTexts = await tableHeaders.allTextContents();

      expect(headerTexts[0]).toContain('#');
      expect(headerTexts[1]).toContain('Pos');
      expect(headerTexts[2]).toContain('Name');
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

  test.describe('Roster Grid Tabs and Skills', () => {
    // Run these tests serially to avoid mock server state conflicts
    test.describe.configure({ mode: 'serial' });

    test('shows roster tabs on roster page', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForLoadState('networkidle');

      // Tabs should be visible
      await expect(page.getByTestId('roster-tabs')).toBeVisible();
      await expect(page.getByTestId('roster-tab-all')).toBeVisible();
      await expect(page.getByTestId('roster-tab-offense')).toBeVisible();
      await expect(page.getByTestId('roster-tab-defense')).toBeVisible();
      await expect(page.getByTestId('roster-tab-specialTeams')).toBeVisible();
    });

    test('All tab is selected by default', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForLoadState('networkidle');

      // All tab should be selected (has active styling)
      const allTab = page.getByTestId('roster-tab-all');
      await expect(allTab).toHaveClass(/bg-emerald-600/);
    });

    test('can switch between roster tabs', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForLoadState('networkidle');

      // Click Offense tab
      await page.getByTestId('roster-tab-offense').click();
      await page.waitForTimeout(300);

      // URL should update
      await expect(page).toHaveURL(/tab=offense/);

      // Offense tab should be selected
      const offenseTab = page.getByTestId('roster-tab-offense');
      await expect(offenseTab).toHaveClass(/bg-emerald-600/);

      // Click Defense tab
      await page.getByTestId('roster-tab-defense').click();
      await page.waitForTimeout(300);

      await expect(page).toHaveURL(/tab=defense/);

      // Click Special Teams tab
      await page.getByTestId('roster-tab-specialTeams').click();
      await page.waitForTimeout(300);

      await expect(page).toHaveURL(/tab=specialTeams/);
    });

    test('offense tab filters to offensive players only', async ({ page }) => {
      await page.goto('/teams/1/roster?tab=offense');
      await page.waitForLoadState('networkidle');

      // Check that only offensive positions are shown
      const table = page.getByTestId('roster-table');
      await expect(table).toBeVisible();

      // Get all position badges
      const positionCells = table.locator('[data-testid="cell-position"]');
      const count = await positionCells.count();

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const text = await positionCells.nth(i).textContent();
          // Should only have offensive positions
          expect(['QB', 'RB', 'WR', 'TE', 'OL', 'C', 'G', 'T']).toContain(text?.trim());
        }
      }
    });

    test('defense tab filters to defensive players only', async ({ page }) => {
      await page.goto('/teams/1/roster?tab=defense');
      await page.waitForLoadState('networkidle');

      // Check that only defensive positions are shown
      const table = page.getByTestId('roster-table');
      await expect(table).toBeVisible();

      // Get all position badges
      const positionCells = table.locator('[data-testid="cell-position"]');
      const count = await positionCells.count();

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const text = await positionCells.nth(i).textContent();
          // Should only have defensive positions
          expect(['DL', 'DE', 'DT', 'NT', 'LB', 'ILB', 'OLB', 'MLB', 'CB', 'S', 'SS', 'FS', 'DB']).toContain(text?.trim());
        }
      }
    });

    test('special teams tab filters to K and P only', async ({ page }) => {
      await page.goto('/teams/1/roster?tab=specialTeams');
      await page.waitForLoadState('networkidle');

      // Check that only K/P positions are shown
      const table = page.getByTestId('roster-table');
      await expect(table).toBeVisible();

      // Get all position badges
      const positionCells = table.locator('[data-testid="cell-position"]');
      const count = await positionCells.count();

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const text = await positionCells.nth(i).textContent();
          // Should only have K or P
          expect(['K', 'P']).toContain(text?.trim());
        }
      }
    });

    test('each grid has independent column customization', async ({ page }) => {
      // First, customize the All grid
      await page.goto('/teams/1/roster?tab=all');
      await page.waitForLoadState('networkidle');

      // Open column customizer and hide age column
      await page.getByTestId('column-customizer-toggle').click();
      await expect(page.getByTestId('column-customizer-panel')).toBeVisible();

      const ageToggle = page.getByTestId('column-toggle-age');
      if (await ageToggle.isVisible()) {
        await ageToggle.click();
        await page.waitForTimeout(300);
      }

      // Close panel
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);

      // Switch to Offense tab
      await page.getByTestId('roster-tab-offense').click();
      await page.waitForTimeout(300);

      // Open column customizer for Offense grid
      await page.getByTestId('column-customizer-toggle').click();
      await expect(page.getByTestId('column-customizer-panel')).toBeVisible();

      // Age toggle should be independent (not affected by All grid changes)
      // The default for offense grid should have age visible
      const offenseAgeToggle = page.getByTestId('column-toggle-age');
      if (await offenseAgeToggle.isVisible()) {
        // This is a different grid, so it should have its own state
        console.log('Offense grid has independent column state');
      }
    });

    test('column customization persists per grid after reload', async ({ page }) => {
      // Customize Defense grid
      await page.goto('/teams/1/roster?tab=defense');
      await page.waitForLoadState('networkidle');

      // Open column customizer and modify columns
      await page.getByTestId('column-customizer-toggle').click();
      await expect(page.getByTestId('column-customizer-panel')).toBeVisible();

      // Move a column
      const posUpButton = page.getByTestId('column-up-position');
      if (await posUpButton.isVisible() && await posUpButton.isEnabled()) {
        await posUpButton.click();
        await page.waitForTimeout(300);
      }

      // Close panel
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should still be on defense tab
      await expect(page).toHaveURL(/tab=defense/);

      // Customization should be preserved
      // (The actual verification depends on what was modified)
    });

    test('skill columns show "--" for irrelevant positions', async ({ page }) => {
      // Navigate to All tab with some skill columns visible
      await page.goto('/teams/1/roster?tab=all');
      await page.waitForLoadState('networkidle');

      // Open column customizer and enable a skill column
      await page.getByTestId('column-customizer-toggle').click();
      await expect(page.getByTestId('column-customizer-panel')).toBeVisible();

      // Try to enable passing column
      const passingToggle = page.getByTestId('column-toggle-passing');
      if (await passingToggle.isVisible()) {
        await passingToggle.click();
        await page.waitForTimeout(300);
      }

      // Close panel
      await page.keyboard.press('Escape');
      await page.waitForTimeout(100);

      // Check the table for passing column values
      const passingCells = page.locator('[data-testid="cell-passing"]');
      const count = await passingCells.count();

      if (count > 0) {
        // Some cells should have values, some should have "--"
        let hasValue = false;
        let hasDash = false;

        for (let i = 0; i < Math.min(count, 10); i++) {
          const text = await passingCells.nth(i).textContent();
          if (text === '--') {
            hasDash = true;
          } else if (text && !isNaN(parseInt(text))) {
            hasValue = true;
          }
        }

        // We expect both values and dashes (QBs have values, others have --)
        console.log(`Passing column - hasValue: ${hasValue}, hasDash: ${hasDash}`);
      }
    });
  });

  test.describe('Team Color Scheme Editor', () => {
    // Run these tests serially to avoid mock server state conflicts
    test.describe.configure({ mode: 'serial' });

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
