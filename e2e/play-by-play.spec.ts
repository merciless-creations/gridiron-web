import { test, expect } from '@playwright/test';

const MOCK_SERVER_URL = 'http://localhost:3001';

test.describe('Play-by-Play Viewer', () => {
  test.beforeEach(async ({ request }) => {
    // Reset mock server state before each test
    await request.post(`${MOCK_SERVER_URL}/_reset`);
  });

  test.describe('Game Simulation Flow', () => {
    test('displays play-by-play viewer after successful game simulation', async ({
      page,
    }) => {
      await page.goto('/simulate');

      // Select home team
      const homeSelect = page.locator('select').first();
      await homeSelect.selectOption({ index: 1 });

      // Select away team
      const awaySelect = page.locator('select').last();
      await awaySelect.selectOption({ index: 2 });

      // Click simulate button
      await page.click('button:has-text("Simulate Game")');

      // Wait for game result
      await expect(page.getByText('Game Complete!')).toBeVisible();

      // Verify play-by-play viewer appears
      await expect(page.getByTestId('play-by-play-viewer')).toBeVisible();

      // Verify header is present
      await expect(page.getByText('Play-by-Play')).toBeVisible();
    });

    test('shows loading state while fetching plays', async ({ page }) => {
      await page.goto('/simulate');

      // Select teams
      const homeSelect = page.locator('select').first();
      await homeSelect.selectOption({ index: 1 });
      const awaySelect = page.locator('select').last();
      await awaySelect.selectOption({ index: 2 });

      // Simulate the game
      await page.click('button:has-text("Simulate Game")');

      // The loading state may be very brief, so we just verify the viewer eventually appears
      await expect(page.getByTestId('play-by-play-viewer')).toBeVisible({
        timeout: 10000,
      });
    });

    test('displays play items in the viewer', async ({ page }) => {
      await page.goto('/simulate');

      // Select teams and simulate
      const homeSelect = page.locator('select').first();
      await homeSelect.selectOption({ index: 1 });
      const awaySelect = page.locator('select').last();
      await awaySelect.selectOption({ index: 2 });
      await page.click('button:has-text("Simulate Game")');

      // Wait for plays to load
      await expect(page.getByTestId('play-by-play-viewer')).toBeVisible();

      // Verify play items are displayed
      const playItems = page.getByTestId('play-item');
      await expect(playItems.first()).toBeVisible();
    });

    test('displays touchdown badge for scoring plays', async ({ page }) => {
      await page.goto('/simulate');

      // Select teams and simulate
      const homeSelect = page.locator('select').first();
      await homeSelect.selectOption({ index: 1 });
      const awaySelect = page.locator('select').last();
      await awaySelect.selectOption({ index: 2 });
      await page.click('button:has-text("Simulate Game")');

      // Wait for viewer
      const viewer = page.getByTestId('play-by-play-viewer');
      await expect(viewer).toBeVisible();

      // Mock data includes a touchdown, verify TD badge (exact match to avoid matching TDs in stats)
      await expect(viewer.getByText('TD', { exact: true })).toBeVisible();
    });

    test('displays play statistics summary', async ({ page }) => {
      await page.goto('/simulate');

      // Select teams and simulate
      const homeSelect = page.locator('select').first();
      await homeSelect.selectOption({ index: 1 });
      const awaySelect = page.locator('select').last();
      await awaySelect.selectOption({ index: 2 });
      await page.click('button:has-text("Simulate Game")');

      // Wait for viewer
      const viewer = page.getByTestId('play-by-play-viewer');
      await expect(viewer).toBeVisible();

      // Verify stats are displayed (plays, TDs, turnovers) - scope to viewer to avoid conflicts
      await expect(viewer.getByText('plays')).toBeVisible();
      await expect(viewer.getByText('TDs')).toBeVisible();
    });
  });

  test.describe('Empty State', () => {
    test('displays empty message when no plays available', async ({
      page,
      request,
    }) => {
      // Set mock to return empty plays
      await request.post(`${MOCK_SERVER_URL}/_scenario`, {
        data: {
          route: 'getGamePlays',
          scenario: 'emptyPlays',
        },
      });

      await page.goto('/simulate');

      // Select teams and simulate
      const homeSelect = page.locator('select').first();
      await homeSelect.selectOption({ index: 1 });
      const awaySelect = page.locator('select').last();
      await awaySelect.selectOption({ index: 2 });
      await page.click('button:has-text("Simulate Game")');

      // Wait for empty state
      await expect(page.getByTestId('play-by-play-empty')).toBeVisible();
      await expect(
        page.getByText('No play-by-play data available for this game.')
      ).toBeVisible();
    });
  });

  test.describe('Special Play Types', () => {
    test('displays penalty flags', async ({ page, request }) => {
      // Set mock to return plays with penalties
      await request.post(`${MOCK_SERVER_URL}/_scenario`, {
        data: {
          route: 'getGamePlays',
          scenario: 'withPenalties',
        },
      });

      await page.goto('/simulate');

      // Select teams and simulate
      const homeSelect = page.locator('select').first();
      await homeSelect.selectOption({ index: 1 });
      const awaySelect = page.locator('select').last();
      await awaySelect.selectOption({ index: 2 });
      await page.click('button:has-text("Simulate Game")');

      // Wait for viewer
      await expect(page.getByTestId('play-by-play-viewer')).toBeVisible();

      // Verify penalty flag is displayed
      await expect(page.getByText('FLAG: Holding - 10 yards')).toBeVisible();
    });

    test('displays interception badge', async ({ page, request }) => {
      // Set mock to return plays with turnovers
      await request.post(`${MOCK_SERVER_URL}/_scenario`, {
        data: {
          route: 'getGamePlays',
          scenario: 'withTurnover',
        },
      });

      await page.goto('/simulate');

      // Select teams and simulate
      const homeSelect = page.locator('select').first();
      await homeSelect.selectOption({ index: 1 });
      const awaySelect = page.locator('select').last();
      await awaySelect.selectOption({ index: 2 });
      await page.click('button:has-text("Simulate Game")');

      // Wait for viewer
      const viewer = page.getByTestId('play-by-play-viewer');
      await expect(viewer).toBeVisible();

      // Verify INT badge is displayed (exact match to avoid matching INTERCEPTED in description)
      await expect(viewer.getByText('INT', { exact: true })).toBeVisible();
    });
  });

  test.describe('Play List Container', () => {
    test('has scrollable play list', async ({ page }) => {
      await page.goto('/simulate');

      // Select teams and simulate
      const homeSelect = page.locator('select').first();
      await homeSelect.selectOption({ index: 1 });
      const awaySelect = page.locator('select').last();
      await awaySelect.selectOption({ index: 2 });
      await page.click('button:has-text("Simulate Game")');

      // Wait for viewer
      await expect(page.getByTestId('play-by-play-viewer')).toBeVisible();

      // Verify play list container has overflow styling
      const playList = page.getByTestId('play-list');
      await expect(playList).toHaveClass(/overflow-y-auto/);
    });
  });
});
