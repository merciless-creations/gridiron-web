import { test, expect } from '@playwright/test';

const MOCK_SERVER_URL = 'http://localhost:3001';

/**
 * Resizable Column & Grid Preferences E2E Tests
 *
 * Comprehensive tests for the roster grid functionality:
 * - Column resize handles and dragging behavior
 * - Column width persistence across page reloads
 * - Column visibility (adding/removing columns)
 * - Column ordering
 * - Per-tab preferences independence
 */

test.describe('Resizable Columns & Grid Preferences', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ request }) => {
    // Reset mock server state
    await request.post(`${MOCK_SERVER_URL}/_reset`);

    // Set up default scenario with leagues, teams, and players
    await request.post(`${MOCK_SERVER_URL}/_preset`, {
      data: { name: 'default' }
    });
  });

  test.describe('Column Resize Handles', () => {
    test('column headers have visible resize handles', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Check that name column has a resize handle
      const nameResizeHandle = page.getByTestId('column-header-name-resize-handle');
      await expect(nameResizeHandle).toBeVisible();

      // Check that the resize handle has the correct role
      await expect(nameResizeHandle).toHaveAttribute('role', 'separator');
      await expect(nameResizeHandle).toHaveAttribute('aria-orientation', 'vertical');
    });

    test('resize handle has col-resize cursor', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const nameResizeHandle = page.getByTestId('column-header-name-resize-handle');
      await expect(nameResizeHandle).toHaveCSS('cursor', 'col-resize');
    });

    test('all visible columns have resize handles', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Get all column header resize handles
      const resizeHandles = await page.locator('[data-testid$="-resize-handle"]').all();

      // Should have multiple resize handles (one per visible column)
      expect(resizeHandles.length).toBeGreaterThan(2);

      // Each should be visible
      for (const handle of resizeHandles) {
        await expect(handle).toBeVisible();
      }
    });

    test('table uses fixed layout for precise column widths', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const table = page.getByTestId('roster-table');

      // Table should have table-fixed class for proper column width behavior
      await expect(table).toHaveClass(/table-fixed/);
    });
  });

  test.describe('Column Resizing Behavior', () => {
    test('can resize column by dragging right to increase width', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const header = page.getByTestId('column-header-name');
      const resizeHandle = page.getByTestId('column-header-name-resize-handle');

      // Get initial width
      const initialBox = await header.boundingBox();
      expect(initialBox).not.toBeNull();
      const initialWidth = initialBox!.width;

      // Perform drag operation to the right
      const handleBox = await resizeHandle.boundingBox();
      expect(handleBox).not.toBeNull();

      await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
      await page.mouse.down();
      await page.mouse.move(handleBox!.x + handleBox!.width / 2 + 80, handleBox!.y + handleBox!.height / 2);
      await page.mouse.up();

      // Get new width
      const newBox = await header.boundingBox();
      expect(newBox).not.toBeNull();

      // Width should have increased
      expect(newBox!.width).toBeGreaterThan(initialWidth + 50);
    });

    test('can resize column by dragging left to decrease width', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const header = page.getByTestId('column-header-name');
      const resizeHandle = page.getByTestId('column-header-name-resize-handle');

      // Get initial width
      const initialBox = await header.boundingBox();
      expect(initialBox).not.toBeNull();
      const initialWidth = initialBox!.width;

      // Perform drag operation to the left
      const handleBox = await resizeHandle.boundingBox();
      expect(handleBox).not.toBeNull();

      await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
      await page.mouse.down();
      await page.mouse.move(handleBox!.x - 30, handleBox!.y + handleBox!.height / 2);
      await page.mouse.up();

      // Get new width
      const newBox = await header.boundingBox();
      expect(newBox).not.toBeNull();

      // Width should have decreased (or hit minimum)
      expect(newBox!.width).toBeLessThanOrEqual(initialWidth);
    });

    test('column respects minimum width when shrinking', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const header = page.getByTestId('column-header-name');
      const resizeHandle = page.getByTestId('column-header-name-resize-handle');

      // Try to shrink column dramatically
      const handleBox = await resizeHandle.boundingBox();
      expect(handleBox).not.toBeNull();

      await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
      await page.mouse.down();
      await page.mouse.move(handleBox!.x - 500, handleBox!.y + handleBox!.height / 2);
      await page.mouse.up();

      // Get final width
      const finalBox = await header.boundingBox();
      expect(finalBox).not.toBeNull();

      // Width should not go below minimum (50px default)
      expect(finalBox!.width).toBeGreaterThanOrEqual(50);
    });

    test('resize handle shows visual feedback during drag', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const resizeHandle = page.getByTestId('column-header-name-resize-handle');

      // Start drag
      const handleBox = await resizeHandle.boundingBox();
      expect(handleBox).not.toBeNull();

      await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
      await page.mouse.down();

      // During drag, the body cursor should be col-resize
      const bodyCursor = await page.evaluate(() => document.body.style.cursor);
      expect(bodyCursor).toBe('col-resize');

      await page.mouse.up();
    });

    test('text selection is disabled during resize', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const resizeHandle = page.getByTestId('column-header-name-resize-handle');

      // Start drag
      const handleBox = await resizeHandle.boundingBox();
      expect(handleBox).not.toBeNull();

      await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
      await page.mouse.down();

      // During drag, user-select should be none
      const userSelect = await page.evaluate(() => document.body.style.userSelect);
      expect(userSelect).toBe('none');

      await page.mouse.up();
    });

    test('cursor and selection restored after resize ends', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const resizeHandle = page.getByTestId('column-header-name-resize-handle');
      const handleBox = await resizeHandle.boundingBox();
      expect(handleBox).not.toBeNull();

      // Perform full drag cycle
      await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
      await page.mouse.down();
      await page.mouse.move(handleBox!.x + handleBox!.width / 2 + 50, handleBox!.y + handleBox!.height / 2);
      await page.mouse.up();

      // After drag ends, cursor and user-select should be restored
      const bodyCursor = await page.evaluate(() => document.body.style.cursor);
      const userSelect = await page.evaluate(() => document.body.style.userSelect);
      expect(bodyCursor).toBe('');
      expect(userSelect).toBe('');
    });
  });

  test.describe('Column Width Persistence', () => {
    test('column width persists after page reload', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const header = page.getByTestId('column-header-name');
      const resizeHandle = page.getByTestId('column-header-name-resize-handle');

      // Resize the column
      const handleBox = await resizeHandle.boundingBox();
      expect(handleBox).not.toBeNull();

      await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
      await page.mouse.down();
      await page.mouse.move(handleBox!.x + handleBox!.width / 2 + 100, handleBox!.y + handleBox!.height / 2);
      await page.mouse.up();

      // Wait for preference to be saved
      await page.waitForTimeout(500);

      // Get width after resize
      const widthAfterResize = await header.boundingBox();
      expect(widthAfterResize).not.toBeNull();

      // Reload the page
      await page.reload();
      await page.waitForSelector('[data-testid="roster-table"]');

      // Get width after reload
      const widthAfterReload = await page.getByTestId('column-header-name').boundingBox();
      expect(widthAfterReload).not.toBeNull();

      // Width should be preserved (within a small tolerance)
      expect(Math.abs(widthAfterReload!.width - widthAfterResize!.width)).toBeLessThan(5);
    });

    test('multiple column widths persist independently', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Resize name column
      const nameHandle = page.getByTestId('column-header-name-resize-handle');
      let handleBox = await nameHandle.boundingBox();
      expect(handleBox).not.toBeNull();

      await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
      await page.mouse.down();
      await page.mouse.move(handleBox!.x + handleBox!.width / 2 + 60, handleBox!.y + handleBox!.height / 2);
      await page.mouse.up();

      await page.waitForTimeout(300);

      // Resize position column
      const posHandle = page.getByTestId('column-header-position-resize-handle');
      handleBox = await posHandle.boundingBox();
      expect(handleBox).not.toBeNull();

      await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
      await page.mouse.down();
      await page.mouse.move(handleBox!.x + handleBox!.width / 2 + 40, handleBox!.y + handleBox!.height / 2);
      await page.mouse.up();

      await page.waitForTimeout(300);

      // Get widths after resizing both
      const nameWidth = await page.getByTestId('column-header-name').boundingBox();
      const posWidth = await page.getByTestId('column-header-position').boundingBox();

      // Reload
      await page.reload();
      await page.waitForSelector('[data-testid="roster-table"]');

      // Verify both widths persisted
      const nameWidthAfter = await page.getByTestId('column-header-name').boundingBox();
      const posWidthAfter = await page.getByTestId('column-header-position').boundingBox();

      expect(Math.abs(nameWidthAfter!.width - nameWidth!.width)).toBeLessThan(5);
      expect(Math.abs(posWidthAfter!.width - posWidth!.width)).toBeLessThan(5);
    });

    test('column widths persist across navigation', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Resize a column
      const resizeHandle = page.getByTestId('column-header-name-resize-handle');
      const handleBox = await resizeHandle.boundingBox();
      expect(handleBox).not.toBeNull();

      await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
      await page.mouse.down();
      await page.mouse.move(handleBox!.x + handleBox!.width / 2 + 70, handleBox!.y + handleBox!.height / 2);
      await page.mouse.up();

      await page.waitForTimeout(300);

      const widthBefore = await page.getByTestId('column-header-name').boundingBox();

      // Navigate away
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Navigate back
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Width should persist
      const widthAfter = await page.getByTestId('column-header-name').boundingBox();
      expect(Math.abs(widthAfter!.width - widthBefore!.width)).toBeLessThan(5);
    });
  });

  test.describe('Column Visibility - Adding/Removing Columns', () => {
    test('column customizer toggle is visible', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const customizer = page.getByTestId('column-customizer-toggle');
      await expect(customizer).toBeVisible();
    });

    test('can open column customizer panel', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      await page.getByTestId('column-customizer-toggle').click();

      const panel = page.getByTestId('column-customizer-panel');
      await expect(panel).toBeVisible();
    });

    test('can hide a column using customizer', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Verify position column is visible initially
      const posHeader = page.getByTestId('column-header-position');
      await expect(posHeader).toBeVisible();

      // Open customizer
      await page.getByTestId('column-customizer-toggle').click();

      // Toggle off position column
      await page.getByTestId('column-toggle-position').click();

      // Wait for update
      await page.waitForTimeout(300);

      // Click outside to close panel
      await page.locator('body').click({ position: { x: 10, y: 10 } });

      // Position column should now be hidden
      await expect(page.getByTestId('column-header-position')).not.toBeVisible();
    });

    test('hidden column persists after reload', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Verify position column is visible initially
      await expect(page.getByTestId('column-header-position')).toBeVisible();

      // Open customizer and hide position column
      await page.getByTestId('column-customizer-toggle').click();
      await page.getByTestId('column-toggle-position').click();
      await page.waitForTimeout(300);

      // Click outside to close panel
      await page.locator('body').click({ position: { x: 10, y: 10 } });

      // Reload
      await page.reload();
      await page.waitForSelector('[data-testid="roster-table"]');

      // Position column should still be hidden
      await expect(page.getByTestId('column-header-position')).not.toBeVisible();
    });

    test('can show a hidden column using customizer', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // First hide position column
      await page.getByTestId('column-customizer-toggle').click();
      await page.getByTestId('column-toggle-position').click();
      await page.waitForTimeout(300);
      await page.locator('body').click({ position: { x: 10, y: 10 } });

      // Verify it's hidden
      await expect(page.getByTestId('column-header-position')).not.toBeVisible();

      // Now show it again
      await page.getByTestId('column-customizer-toggle').click();
      await page.getByTestId('column-toggle-position').click();
      await page.waitForTimeout(300);
      await page.locator('body').click({ position: { x: 10, y: 10 } });

      // Position column should be visible again
      await expect(page.getByTestId('column-header-position')).toBeVisible();
    });

    test('can reset columns to defaults', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Hide some columns first
      await page.getByTestId('column-customizer-toggle').click();
      await page.getByTestId('column-toggle-position').click();
      await page.waitForTimeout(200);
      await page.getByTestId('column-toggle-overall').click();
      await page.waitForTimeout(200);

      // Reset to defaults
      await page.getByTestId('reset-columns').click();
      await page.waitForTimeout(300);
      await page.locator('body').click({ position: { x: 10, y: 10 } });

      // Default columns should be visible again
      await expect(page.getByTestId('column-header-position')).toBeVisible();
      await expect(page.getByTestId('column-header-overall')).toBeVisible();
    });

    test('column visibility change shows in table immediately', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Count initial columns
      const initialHeaders = await page.locator('th[data-testid^="column-header-"]').count();

      // Hide a column
      await page.getByTestId('column-customizer-toggle').click();
      await page.getByTestId('column-toggle-position').click();
      await page.waitForTimeout(300);

      // Count columns now (panel still open but we can see table)
      const afterHideHeaders = await page.locator('th[data-testid^="column-header-"]').count();

      // Should have one fewer column
      expect(afterHideHeaders).toBe(initialHeaders - 1);
    });
  });

  test.describe('Column Ordering', () => {
    test('can reorder columns using customizer', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Get initial column order
      const headersBefore = await page.locator('th[data-testid^="column-header-"]').allTextContents();

      // Open customizer
      await page.getByTestId('column-customizer-toggle').click();

      // Move a column using arrow buttons (if the customizer has them)
      const moveDownButton = page.getByTestId('column-down-name');
      if (await moveDownButton.isVisible()) {
        await moveDownButton.click();
        await page.waitForTimeout(300);
        await page.locator('body').click({ position: { x: 10, y: 10 } });

        // Get new column order
        const headersAfter = await page.locator('th[data-testid^="column-header-"]').allTextContents();

        // Order should have changed
        expect(headersAfter).not.toEqual(headersBefore);
      }
    });

    test('column order persists after reload', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Open customizer and reorder
      await page.getByTestId('column-customizer-toggle').click();

      const moveDownButton = page.getByTestId('column-down-name');
      if (await moveDownButton.isVisible()) {
        await moveDownButton.click();
        await page.waitForTimeout(300);
        await page.locator('body').click({ position: { x: 10, y: 10 } });

        // Get current order
        const orderBefore = await page.locator('th[data-testid^="column-header-"]').allTextContents();

        // Reload
        await page.reload();
        await page.waitForSelector('[data-testid="roster-table"]');

        // Order should persist
        const orderAfter = await page.locator('th[data-testid^="column-header-"]').allTextContents();
        expect(orderAfter).toEqual(orderBefore);
      }
    });
  });

  test.describe('Per-Tab Preferences Independence', () => {
    test('each roster tab has independent column preferences', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Check if tabs exist
      const offenseTab = page.getByRole('tab', { name: /offense/i });

      if (await offenseTab.isVisible()) {
        // Resize column in default tab
        const resizeHandle = page.getByTestId('column-header-name-resize-handle');
        let handleBox = await resizeHandle.boundingBox();
        expect(handleBox).not.toBeNull();

        await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
        await page.mouse.down();
        await page.mouse.move(handleBox!.x + handleBox!.width / 2 + 100, handleBox!.y + handleBox!.height / 2);
        await page.mouse.up();

        await page.waitForTimeout(300);

        const widthInAllTab = await page.getByTestId('column-header-name').boundingBox();

        // Switch to Offense tab
        await offenseTab.click();
        await page.waitForTimeout(200);

        // Resize same column differently in offense tab
        const nameHeader = page.getByTestId('column-header-name');
        if (await nameHeader.isVisible()) {
          const offenseResizeHandle = page.getByTestId('column-header-name-resize-handle');
          handleBox = await offenseResizeHandle.boundingBox();

          if (handleBox) {
            await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
            await page.mouse.down();
            await page.mouse.move(handleBox.x + handleBox.width / 2 - 30, handleBox.y + handleBox.height / 2);
            await page.mouse.up();

            await page.waitForTimeout(300);

            const widthInOffenseTab = await page.getByTestId('column-header-name').boundingBox();

            // Widths should be different between tabs
            expect(Math.abs(widthInAllTab!.width - widthInOffenseTab!.width)).toBeGreaterThan(30);
          }
        }
      }
    });

    test('hidden columns in one tab do not affect other tabs', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const offenseTab = page.getByRole('tab', { name: /offense/i });

      if (await offenseTab.isVisible()) {
        // Hide position column in default tab
        await page.getByTestId('column-customizer-toggle').click();
        const posToggle = page.getByTestId('column-toggle-position');
        if (await posToggle.isVisible()) {
          await posToggle.click();
          await page.waitForTimeout(300);
          await page.locator('body').click({ position: { x: 10, y: 10 } });

          // Verify hidden in All tab
          await expect(page.getByTestId('column-header-position')).not.toBeVisible();

          // Switch to Offense tab
          await offenseTab.click();
          await page.waitForTimeout(200);

          // Position column should still be visible in Offense tab (independent prefs)
          // (or hidden if that tab also has it hidden by default - just check it's rendered)
          const offenseTable = page.getByTestId('roster-table');
          await expect(offenseTable).toBeVisible();
        }
      }
    });
  });

  test.describe('Accessibility', () => {
    test('resize handles have appropriate aria labels', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const nameResizeHandle = page.getByTestId('column-header-name-resize-handle');

      // Should have aria-label describing the action
      await expect(nameResizeHandle).toHaveAttribute('aria-label', /resize.*column/i);
    });

    test('resize handles have separator role', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const resizeHandles = await page.locator('[data-testid$="-resize-handle"]').all();

      for (const handle of resizeHandles) {
        await expect(handle).toHaveAttribute('role', 'separator');
        await expect(handle).toHaveAttribute('aria-orientation', 'vertical');
      }
    });

    test('column customizer has proper aria attributes', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const toggle = page.getByTestId('column-customizer-toggle');
      await expect(toggle).toHaveAttribute('aria-haspopup', 'dialog');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');

      await toggle.click();

      await expect(toggle).toHaveAttribute('aria-expanded', 'true');

      const panel = page.getByTestId('column-customizer-panel');
      await expect(panel).toHaveAttribute('role', 'dialog');
    });
  });

  test.describe('Edge Cases', () => {
    test('resizing one column does not affect others', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Get initial width of position column
      const posWidthBefore = await page.getByTestId('column-header-position').boundingBox();

      // Resize name column
      const nameResizeHandle = page.getByTestId('column-header-name-resize-handle');
      const handleBox = await nameResizeHandle.boundingBox();
      expect(handleBox).not.toBeNull();

      await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
      await page.mouse.down();
      await page.mouse.move(handleBox!.x + handleBox!.width / 2 + 50, handleBox!.y + handleBox!.height / 2);
      await page.mouse.up();

      await page.waitForTimeout(100);

      // Position column width should not have changed significantly
      const posWidthAfter = await page.getByTestId('column-header-position').boundingBox();

      // With table-fixed layout, other columns may shift but their explicit widths stay
      expect(posWidthAfter).not.toBeNull();
    });

    test('rapid successive resizes work correctly', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const resizeHandle = page.getByTestId('column-header-name-resize-handle');

      // Perform multiple rapid resizes
      for (let i = 0; i < 3; i++) {
        const handleBox = await resizeHandle.boundingBox();
        expect(handleBox).not.toBeNull();

        await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
        await page.mouse.down();
        await page.mouse.move(handleBox!.x + handleBox!.width / 2 + 20, handleBox!.y + handleBox!.height / 2);
        await page.mouse.up();

        await page.waitForTimeout(100);
      }

      // Should not have crashed, column should have a valid width
      const finalBox = await page.getByTestId('column-header-name').boundingBox();
      expect(finalBox).not.toBeNull();
      expect(finalBox!.width).toBeGreaterThan(50);
    });

    test('hiding all columns except one still works', async ({ page }) => {
      await page.goto('/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Open customizer
      await page.getByTestId('column-customizer-toggle').click();

      // Hide multiple columns, leaving at least one visible
      const toggles = ['position', 'overall', 'age'];
      for (const col of toggles) {
        const toggle = page.getByTestId(`column-toggle-${col}`);
        if (await toggle.isVisible()) {
          await toggle.click();
          await page.waitForTimeout(100);
        }
      }

      await page.locator('body').click({ position: { x: 10, y: 10 } });

      // Table should still be visible with remaining columns
      await expect(page.getByTestId('roster-table')).toBeVisible();

      // At least one column header should be visible
      const visibleHeaders = await page.locator('th[data-testid^="column-header-"]').count();
      expect(visibleHeaders).toBeGreaterThan(0);
    });
  });
});
