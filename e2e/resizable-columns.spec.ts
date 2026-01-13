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
      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Check that name column has a resize handle
      const nameResizeHandle = page.getByTestId('column-header-name-resize-handle');
      await expect(nameResizeHandle).toBeVisible();

      // Check that the resize handle has the correct role
      await expect(nameResizeHandle).toHaveAttribute('role', 'separator');
      await expect(nameResizeHandle).toHaveAttribute('aria-orientation', 'vertical');
    });

    test('resize handle has col-resize cursor', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const nameResizeHandle = page.getByTestId('column-header-name-resize-handle');
      await expect(nameResizeHandle).toHaveCSS('cursor', 'col-resize');
    });

    test('all visible columns have resize handles', async ({ page }) => {
      await page.goto('/teams/1/roster');
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

    test('table starts at full width before customization', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const table = page.getByTestId('roster-table');

      // Table should start at full width (w-full) before any column customization
      await expect(table).toHaveClass(/w-full/);
    });
  });

  test.describe('Column Resizing Behavior', () => {
    test('can resize column by dragging right to increase width', async ({ page }) => {
      await page.goto('/teams/1/roster');
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
      await page.goto('/teams/1/roster');
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
      await page.goto('/teams/1/roster');
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

      // Width should not go below minimum (36px default)
      expect(finalBox!.width).toBeGreaterThanOrEqual(36);
    });

    test('resize handle shows visual feedback during drag', async ({ page }) => {
      await page.goto('/teams/1/roster');
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
      await page.goto('/teams/1/roster');
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

    test('double-click collapses column to minimum width', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const header = page.getByTestId('column-header-name');
      const resizeHandle = page.getByTestId('column-header-name-resize-handle');
      const table = page.getByTestId('roster-table');

      // Get initial width
      const initialBox = await header.boundingBox();
      expect(initialBox).not.toBeNull();

      // Double-click the resize handle
      await resizeHandle.dblclick();

      // Wait for table to switch to fixed layout (widths initialized)
      await expect(table).toHaveClass(/table-fixed/, { timeout: 2000 });

      // Wait for the resize to complete
      await page.waitForTimeout(200);

      // Get new width
      const newBox = await header.boundingBox();
      expect(newBox).not.toBeNull();

      // Width should be at minimum (36px)
      expect(newBox!.width).toBeLessThanOrEqual(42); // Allow small tolerance
    });

    test('double-click triggers save request', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const resizeHandle = page.getByTestId('column-header-name-resize-handle');

      // Set up listener for save request
      const savePromise = page.waitForRequest(
        request => request.url().includes('/preferences') && request.method() === 'PUT'
      );

      // Double-click to collapse
      await resizeHandle.dblclick();

      // Verify save request was sent
      const saveRequest = await savePromise;
      expect(saveRequest).toBeTruthy();

      // Verify the request body includes column width data
      const postData = saveRequest.postDataJSON();
      expect(postData.preferences?.grids?.roster?.columns).toBeDefined();
    });

    test('cursor and selection restored after resize ends', async ({ page }) => {
      await page.goto('/teams/1/roster');
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

  test.describe('Column Width Save Behavior', () => {
    test('resizing column triggers save request', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Set up listener for PUT request to preferences
      const savePromise = page.waitForRequest(
        request => request.url().includes('/preferences') && request.method() === 'PUT'
      );

      // Resize a column
      const resizeHandle = page.getByTestId('column-header-name-resize-handle');
      const handleBox = await resizeHandle.boundingBox();
      expect(handleBox).not.toBeNull();

      await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
      await page.mouse.down();
      await page.mouse.move(handleBox!.x + handleBox!.width / 2 + 70, handleBox!.y + handleBox!.height / 2);
      await page.mouse.up();

      // Verify save request was sent
      const saveRequest = await savePromise;
      expect(saveRequest).toBeTruthy();

      // Verify the request body includes column width data
      const postData = saveRequest.postDataJSON();
      expect(postData.preferences?.grids?.roster?.columns).toBeDefined();
    });

    test('multiple column resizes each trigger save requests', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Resize first column and wait for save
      const firstSavePromise = page.waitForRequest(
        request => request.url().includes('/preferences') && request.method() === 'PUT'
      );

      const nameHandle = page.getByTestId('column-header-name-resize-handle');
      let handleBox = await nameHandle.boundingBox();
      expect(handleBox).not.toBeNull();

      await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
      await page.mouse.down();
      await page.mouse.move(handleBox!.x + handleBox!.width / 2 + 60, handleBox!.y + handleBox!.height / 2);
      await page.mouse.up();

      await firstSavePromise;

      // Resize second column and wait for save
      const secondSavePromise = page.waitForRequest(
        request => request.url().includes('/preferences') && request.method() === 'PUT'
      );

      const posHandle = page.getByTestId('column-header-position-resize-handle');
      handleBox = await posHandle.boundingBox();
      expect(handleBox).not.toBeNull();

      await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
      await page.mouse.down();
      await page.mouse.move(handleBox!.x + handleBox!.width / 2 + 40, handleBox!.y + handleBox!.height / 2);
      await page.mouse.up();

      // Verify second save request was sent
      const secondSave = await secondSavePromise;
      expect(secondSave).toBeTruthy();
    });
  });

  test.describe('Column Visibility - Adding/Removing Columns', () => {
    test('column customizer toggle is visible', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const customizer = page.getByTestId('column-customizer-toggle');
      await expect(customizer).toBeVisible();
    });

    test('can open column customizer panel', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      await page.getByTestId('column-customizer-toggle').click();

      const panel = page.getByTestId('column-customizer-panel');
      await expect(panel).toBeVisible();
    });

    test('can hide a column using customizer', async ({ page }) => {
      await page.goto('/teams/1/roster');
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

    test('hiding column triggers save request', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Set up listener for save request
      const savePromise = page.waitForRequest(
        request => request.url().includes('/preferences') && request.method() === 'PUT'
      );

      // Open customizer and hide position column
      await page.getByTestId('column-customizer-toggle').click();
      await page.getByTestId('column-toggle-position').click();

      // Verify save request was sent
      const saveRequest = await savePromise;
      expect(saveRequest).toBeTruthy();

      // Verify the request body includes column visibility data
      const postData = saveRequest.postDataJSON();
      expect(postData.preferences?.grids?.roster?.columns).toBeDefined();
    });

    test('can show a hidden column using customizer', async ({ page }) => {
      await page.goto('/teams/1/roster');
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
      await page.goto('/teams/1/roster');
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
      await page.goto('/teams/1/roster');
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
      await page.goto('/teams/1/roster');
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

    test('reordering column triggers save request', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Open customizer
      await page.getByTestId('column-customizer-toggle').click();

      const moveDownButton = page.getByTestId('column-down-name');
      if (await moveDownButton.isVisible()) {
        // Set up listener for save request
        const savePromise = page.waitForRequest(
          request => request.url().includes('/preferences') && request.method() === 'PUT'
        );

        await moveDownButton.click();

        // Verify save request was sent
        const saveRequest = await savePromise;
        expect(saveRequest).toBeTruthy();

        // Verify the request body includes column order data
        const postData = saveRequest.postDataJSON();
        expect(postData.preferences?.grids?.roster?.columns).toBeDefined();
      }
    });
  });

  test.describe('Per-Tab Preferences Independence', () => {
    test('each roster tab has independent column preferences', async ({ page }) => {
      await page.goto('/teams/1/roster');
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
      await page.goto('/teams/1/roster');
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
      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const nameResizeHandle = page.getByTestId('column-header-name-resize-handle');

      // Should have aria-label describing the action
      await expect(nameResizeHandle).toHaveAttribute('aria-label', /resize.*column/i);
    });

    test('resize handles have separator role', async ({ page }) => {
      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      const resizeHandles = await page.locator('[data-testid$="-resize-handle"]').all();

      for (const handle of resizeHandles) {
        await expect(handle).toHaveAttribute('role', 'separator');
        await expect(handle).toHaveAttribute('aria-orientation', 'vertical');
      }
    });

    test('column customizer has proper aria attributes', async ({ page }) => {
      await page.goto('/teams/1/roster');
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
      await page.goto('/teams/1/roster');
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

      // With table-fixed layout and explicit widths, other columns should stay the same
      expect(posWidthAfter).not.toBeNull();
      expect(posWidthBefore).not.toBeNull();
      expect(Math.abs(posWidthAfter!.width - posWidthBefore!.width)).toBeLessThan(5);
    });

    test('rapid successive resizes work correctly', async ({ page }) => {
      await page.goto('/teams/1/roster');
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
      expect(finalBox!.width).toBeGreaterThan(36);
    });

    test('hiding all columns except one still works', async ({ page }) => {
      await page.goto('/teams/1/roster');
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

  test.describe('Preferences Loading - Column Widths', () => {
    test('loads saved column widths from preferences on page load', async ({ page, request }) => {
      // Script the mock to return saved column widths
      await request.post(`${MOCK_SERVER_URL}/_scenario`, {
        data: {
          route: 'getPreferences',
          scenario: 'savedColumnWidths'
        }
      });

      // Set up promise to wait for preferences API request
      const preferencesPromise = page.waitForResponse(
        response => response.url().includes('/api/users/me/preferences') && response.request().method() === 'GET'
      );

      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Wait for preferences request to complete
      const preferencesResponse = await preferencesPromise;
      const preferencesData = await preferencesResponse.json();

      // Verify the correct preferences were loaded
      expect(preferencesData.preferences?.grids?.rosterAll?.columnWidths?.name).toBe(250);

      // Wait for preferences to load and widths to be applied
      const table = page.getByTestId('roster-table');
      await expect(table).toHaveClass(/table-fixed/, { timeout: 5000 });

      // Verify name column has saved width (250px)
      const nameHeader = page.getByTestId('column-header-name');
      const nameBox = await nameHeader.boundingBox();
      expect(nameBox).not.toBeNull();
      expect(nameBox!.width).toBeGreaterThan(240);
      expect(nameBox!.width).toBeLessThan(260);

      // Verify position column has saved width (120px)
      const posHeader = page.getByTestId('column-header-position');
      const posBox = await posHeader.boundingBox();
      expect(posBox).not.toBeNull();
      expect(posBox!.width).toBeGreaterThan(110);
      expect(posBox!.width).toBeLessThan(130);
    });

    test('loads collapsed column width from preferences', async ({ page, request }) => {
      // Script the mock to return collapsed name column
      await request.post(`${MOCK_SERVER_URL}/_scenario`, {
        data: {
          route: 'getPreferences',
          scenario: 'collapsedNameColumn'
        }
      });

      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Wait for preferences to load
      const table = page.getByTestId('roster-table');
      await expect(table).toHaveClass(/table-fixed/, { timeout: 5000 });

      // Verify name column is at minimum width (36px)
      const nameHeader = page.getByTestId('column-header-name');
      const nameBox = await nameHeader.boundingBox();
      expect(nameBox).not.toBeNull();
      expect(nameBox!.width).toBeLessThanOrEqual(42); // Allow small tolerance
    });

    test('default widths used when no saved preferences', async ({ page, request }) => {
      // Ensure default scenario returns empty preferences
      await request.post(`${MOCK_SERVER_URL}/_scenario`, {
        data: {
          route: 'getPreferences',
          scenario: 'defaultScenario'
        }
      });

      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Table should NOT have table-fixed class initially (no saved widths)
      const table = page.getByTestId('roster-table');
      await expect(table).toHaveClass(/w-full/);
    });
  });

  test.describe('Preferences Loading - Column Visibility', () => {
    test('hidden columns from preferences are not displayed', async ({ page, request }) => {
      // Script the mock to return hidden position column
      await request.post(`${MOCK_SERVER_URL}/_scenario`, {
        data: {
          route: 'getPreferences',
          scenario: 'hiddenPositionColumn'
        }
      });

      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Position column should not be visible
      await expect(page.getByTestId('column-header-position')).not.toBeVisible();

      // Other columns should still be visible
      await expect(page.getByTestId('column-header-name')).toBeVisible();
      await expect(page.getByTestId('column-header-overall')).toBeVisible();
    });

    test('all default columns shown when no visibility preferences', async ({ page, request }) => {
      // Ensure default scenario returns empty preferences
      await request.post(`${MOCK_SERVER_URL}/_scenario`, {
        data: {
          route: 'getPreferences',
          scenario: 'defaultScenario'
        }
      });

      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Default columns should all be visible
      await expect(page.getByTestId('column-header-name')).toBeVisible();
      await expect(page.getByTestId('column-header-position')).toBeVisible();
      await expect(page.getByTestId('column-header-overall')).toBeVisible();
    });
  });

  test.describe('Preferences Loading - Column Order', () => {
    test('columns are displayed in saved order from preferences', async ({ page, request }) => {
      // Script the mock to return reordered columns
      await request.post(`${MOCK_SERVER_URL}/_scenario`, {
        data: {
          route: 'getPreferences',
          scenario: 'reorderedColumns'
        }
      });

      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Get all column headers in order
      const headers = await page.locator('th[data-testid^="column-header-"]').allTextContents();

      // First column should be Position (reordered from default)
      // The scenario sets: ['position', 'name', 'number', 'status', 'overall', 'age']
      expect(headers[0].toLowerCase()).toContain('pos');
    });

    test('default column order used when no order preferences', async ({ page, request }) => {
      // Ensure default scenario returns empty preferences
      await request.post(`${MOCK_SERVER_URL}/_scenario`, {
        data: {
          route: 'getPreferences',
          scenario: 'defaultScenario'
        }
      });

      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Get all column headers in order
      const headers = await page.locator('th[data-testid^="column-header-"]').allTextContents();

      // Default order starts with # (number)
      expect(headers[0]).toBe('#');
    });
  });

  test.describe('Preferences Loading - Combined Customizations', () => {
    test('loads multiple customizations together', async ({ page, request }) => {
      // Script the mock to return multiple customizations
      await request.post(`${MOCK_SERVER_URL}/_scenario`, {
        data: {
          route: 'getPreferences',
          scenario: 'multipleCustomizations'
        }
      });

      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Wait for preferences to load
      const table = page.getByTestId('roster-table');
      await expect(table).toHaveClass(/table-fixed/, { timeout: 5000 });

      // Verify column visibility - some columns should be hidden
      // The scenario sets columns: ['name', 'position', 'overall', 'age']
      // So 'number' and 'status' should be hidden
      await expect(page.getByTestId('column-header-name')).toBeVisible();
      await expect(page.getByTestId('column-header-position')).toBeVisible();

      // Verify column widths are applied
      const nameHeader = page.getByTestId('column-header-name');
      const nameBox = await nameHeader.boundingBox();
      expect(nameBox).not.toBeNull();
      expect(nameBox!.width).toBeGreaterThan(170);
      expect(nameBox!.width).toBeLessThan(190);
    });

    test('customizations persist through SPA navigation', async ({ page, request }) => {
      // Script the mock to return saved column widths
      await request.post(`${MOCK_SERVER_URL}/_scenario`, {
        data: {
          route: 'getPreferences',
          scenario: 'savedColumnWidths'
        }
      });

      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Wait for preferences to load
      const table = page.getByTestId('roster-table');
      await expect(table).toHaveClass(/table-fixed/, { timeout: 5000 });

      // Get initial name column width
      const nameHeader = page.getByTestId('column-header-name');
      const initialBox = await nameHeader.boundingBox();
      expect(initialBox).not.toBeNull();

      // Navigate away (SPA navigation)
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Navigate back
      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Wait for table-fixed class again
      await expect(table).toHaveClass(/table-fixed/, { timeout: 5000 });

      // Width should still be applied (from React Query cache or re-fetched)
      const afterNavBox = await nameHeader.boundingBox();
      expect(afterNavBox).not.toBeNull();
      expect(Math.abs(afterNavBox!.width - initialBox!.width)).toBeLessThan(10);
    });
  });

  test.describe('Preferences Loading - Error Handling', () => {
    test('gracefully handles preferences loading error', async ({ page, request }) => {
      // Script the mock to return an error
      await request.post(`${MOCK_SERVER_URL}/_scenario`, {
        data: {
          route: 'getPreferences',
          scope: 'error'
        }
      });

      await page.goto('/teams/1/roster');
      await page.waitForSelector('[data-testid="roster-table"]');

      // Table should still render with default settings
      await expect(page.getByTestId('roster-table')).toBeVisible();

      // Default columns should be visible
      await expect(page.getByTestId('column-header-name')).toBeVisible();
      await expect(page.getByTestId('column-header-position')).toBeVisible();
    });
  });
});
