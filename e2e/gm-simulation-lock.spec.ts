/**
 * GM Simulation Lock E2E Tests
 *
 * Tests the GM experience when their league is being simulated:
 * - Banner visibility when simulation is in progress
 * - Banner content and accessibility
 * - Banner disappears when simulation completes
 */
import { test, expect, Page } from '@playwright/test'

const MOCK_SERVER_URL = 'http://localhost:3001'

// Helper to activate a mock preset
async function activatePreset(page: Page, presetName: string) {
  const response = await page.request.post(`${MOCK_SERVER_URL}/_preset`, {
    data: { name: presetName },
  })
  expect(response.ok()).toBeTruthy()
}

// Helper to reset mock server state
async function resetMockServer(page: Page) {
  const response = await page.request.post(`${MOCK_SERVER_URL}/_reset`)
  expect(response.ok()).toBeTruthy()
}

test.describe('GM Simulation Lock Experience', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page }) => {
    await resetMockServer(page)
  })

  test.describe('Simulation Lock Banner - League Detail Page', () => {
    test('displays simulation lock banner when simulation is in progress', async ({ page }) => {
      await activatePreset(page, 'simulation-locked')
      await page.goto('/leagues/1')

      // Wait for page to load
      await expect(page.getByTestId('league-name')).toBeVisible({ timeout: 10000 })

      // Banner should be visible
      const banner = page.getByRole('status', { name: 'Simulation in progress' })
      await expect(banner).toBeVisible()

      // Banner should show simulation message
      await expect(page.getByText(/Simulation in progress/i)).toBeVisible()
    })

    test('banner shows who started the simulation', async ({ page }) => {
      await activatePreset(page, 'simulation-locked')
      await page.goto('/leagues/1')

      await expect(page.getByTestId('league-name')).toBeVisible({ timeout: 10000 })

      // Should show the commissioner's name
      await expect(page.getByText(/Commissioner Bob/i)).toBeVisible()
    })

    test('banner shows simulation duration', async ({ page }) => {
      await activatePreset(page, 'simulation-locked')
      await page.goto('/leagues/1')

      await expect(page.getByTestId('league-name')).toBeVisible({ timeout: 10000 })

      // Should show duration (mock data is 15 mins ago, format may vary)
      await expect(page.getByText(/\d+\s*min/i)).toBeVisible()
    })

    test('banner indicates roster changes are disabled', async ({ page }) => {
      await activatePreset(page, 'simulation-locked')
      await page.goto('/leagues/1')

      await expect(page.getByTestId('league-name')).toBeVisible({ timeout: 10000 })

      // Should explain that roster changes are blocked
      await expect(page.getByText(/Roster and depth chart changes are disabled/i)).toBeVisible()
    })

    test('banner has spinning animation indicator', async ({ page }) => {
      await activatePreset(page, 'simulation-locked')
      await page.goto('/leagues/1')

      await expect(page.getByTestId('league-name')).toBeVisible({ timeout: 10000 })

      // Should have a spinner element
      const spinner = page.locator('.animate-spin')
      await expect(spinner).toBeVisible()
    })

    test('no banner when simulation is not in progress', async ({ page }) => {
      await activatePreset(page, 'simulation-unlocked')
      await page.goto('/leagues/1')

      await expect(page.getByTestId('league-name')).toBeVisible({ timeout: 10000 })

      // Banner should NOT be visible
      const banner = page.getByRole('status', { name: 'Simulation in progress' })
      await expect(banner).not.toBeVisible()
    })
  })

  test.describe('Simulation Lock Banner - Season Dashboard Page', () => {
    test('displays simulation lock banner on season dashboard', async ({ page }) => {
      await activatePreset(page, 'simulation-locked')
      await page.goto('/leagues/1/season')

      // Wait for page to load
      await expect(page.getByRole('heading', { name: 'Season Dashboard' })).toBeVisible({ timeout: 10000 })

      // Banner should be visible
      await expect(page.getByText(/Simulation in progress/i)).toBeVisible()
      await expect(page.getByText(/Commissioner Bob/i)).toBeVisible()
    })

    test('no banner on season dashboard when unlocked', async ({ page }) => {
      await activatePreset(page, 'simulation-unlocked')
      await page.goto('/leagues/1/season')

      await expect(page.getByRole('heading', { name: 'Season Dashboard' })).toBeVisible({ timeout: 10000 })

      // Banner should NOT be visible
      const banner = page.getByRole('status', { name: 'Simulation in progress' })
      await expect(banner).not.toBeVisible()
    })
  })

  test.describe('Banner Accessibility', () => {
    test('banner has correct ARIA role', async ({ page }) => {
      await activatePreset(page, 'simulation-locked')
      await page.goto('/leagues/1')

      await expect(page.getByTestId('league-name')).toBeVisible({ timeout: 10000 })

      // Should have role="status" for screen readers
      const banner = page.getByRole('status', { name: 'Simulation in progress' })
      await expect(banner).toBeVisible()
    })

    test('banner is visually prominent with amber color', async ({ page }) => {
      await activatePreset(page, 'simulation-locked')
      await page.goto('/leagues/1')

      await expect(page.getByTestId('league-name')).toBeVisible({ timeout: 10000 })

      // Banner should have amber background class
      const banner = page.getByRole('status', { name: 'Simulation in progress' })
      await expect(banner).toHaveClass(/amber/)
    })
  })

  test.describe('GM Navigation While Locked', () => {
    test('GM can still navigate to league pages while locked', async ({ page }) => {
      await activatePreset(page, 'simulation-locked')

      // Navigate to league detail
      await page.goto('/leagues/1')
      await expect(page.getByTestId('league-name')).toBeVisible({ timeout: 10000 })

      // Banner should be visible but page should load
      await expect(page.getByText(/Simulation in progress/i)).toBeVisible()

      // Navigate to season dashboard
      await page.goto('/leagues/1/season')
      await expect(page.getByRole('heading', { name: 'Season Dashboard' })).toBeVisible({ timeout: 10000 })

      // Banner should still be visible
      await expect(page.getByText(/Simulation in progress/i)).toBeVisible()
    })

    test('GM can view team roster page while locked', async ({ page }) => {
      await activatePreset(page, 'simulation-locked')

      // Navigate to a team's roster page
      await page.goto('/leagues/1/teams/1/roster')

      // Page should load (may show loading or roster content)
      // The key test is that navigation works, even if roster actions are blocked
      await page.waitForLoadState('networkidle')

      // We're testing that the page loads without error
      // The actual roster lock enforcement would be tested in roster-specific tests
    })
  })
})
