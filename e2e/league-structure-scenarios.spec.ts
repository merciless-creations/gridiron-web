/**
 * League Structure Scenario-Based E2E Tests
 *
 * These tests use mock-json-api scenarios to verify the UI correctly renders
 * different league data shapes. We're testing UI rendering logic, not API behavior.
 *
 * Available scenarios:
 * - fullyFilledLeague: 2 conferences, 8 divisions, 32 teams (NFL-style)
 * - lopsidedLeague: Uneven conference structure (3 divisions vs 1)
 * - emptyLeague: No conferences yet
 */
import { test, expect } from '@playwright/test'

const MOCK_SERVER_URL = 'http://localhost:3001'

/**
 * Helper to switch mock server scenario for a specific route
 * @param route - The route name (e.g., 'getLeague')
 * @param scenario - The scenario name (e.g., 'fullyFilledLeague')
 */
async function setScenario(route: string, scenario: string) {
  const response = await fetch(`${MOCK_SERVER_URL}/_scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ route, scenario }),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to set scenario: ${response.status} ${response.statusText} - ${text}`)
  }
}

/**
 * Helper to reset scenario back to default
 */
async function resetScenario(route: string) {
  await setScenario(route, 'defaultScenario')
}

test.describe('League Structure - Scenario-Based Rendering', () => {
  // Run tests serially since they share a global mock server scenario state.
  // Parallel tests would cause race conditions when setting different scenarios.
  test.describe.configure({ mode: 'serial' })

  // Reset scenario after each test to avoid affecting other tests
  test.afterEach(async () => {
    await resetScenario('getLeague')
  })

  test.describe('Fully Filled League (32 teams)', () => {
    test.beforeEach(async () => {
      await setScenario('getLeague', 'fullyFilledLeague')
    })

    test('renders both conferences', async ({ page }) => {
      await page.goto('/leagues/1/structure')

      // Wait for page to load
      await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10000 })

      // Both conferences should be visible (use exact match to avoid matching division names)
      await expect(page.getByRole('button', { name: 'AFC', exact: true })).toBeVisible()
      await expect(page.getByRole('button', { name: 'NFC', exact: true })).toBeVisible()
    })

    test('renders all 8 divisions', async ({ page }) => {
      await page.goto('/leagues/1/structure')

      // Wait for page to load
      await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10000 })

      // AFC divisions
      await expect(page.getByText('AFC East')).toBeVisible()
      await expect(page.getByText('AFC North')).toBeVisible()
      await expect(page.getByText('AFC South')).toBeVisible()
      await expect(page.getByText('AFC West')).toBeVisible()

      // NFC divisions
      await expect(page.getByText('NFC East')).toBeVisible()
      await expect(page.getByText('NFC North')).toBeVisible()
      await expect(page.getByText('NFC South')).toBeVisible()
      await expect(page.getByText('NFC West')).toBeVisible()
    })

    test('renders team names from each division', async ({ page }) => {
      await page.goto('/leagues/1/structure')

      // Wait for page to load
      await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10000 })

      // Spot check some teams from different divisions
      await expect(page.getByText('Buffalo Bills')).toBeVisible()
      await expect(page.getByText('Pittsburgh Steelers')).toBeVisible()
      await expect(page.getByText('Dallas Cowboys')).toBeVisible()
      await expect(page.getByText('Green Bay Packers')).toBeVisible()
    })
  })

  test.describe('Lopsided League (uneven divisions)', () => {
    test.beforeEach(async () => {
      await setScenario('getLeague', 'lopsidedLeague')
    })

    test('renders conferences with different division counts', async ({ page }) => {
      await page.goto('/leagues/2/structure')

      // Wait for page to load
      await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10000 })

      // Both conferences visible
      await expect(page.getByText('Big Conference')).toBeVisible()
      await expect(page.getByText('Small Conference')).toBeVisible()

      // Big Conference has 3 divisions
      await expect(page.getByText('Division Alpha')).toBeVisible()
      await expect(page.getByText('Division Beta')).toBeVisible()
      await expect(page.getByText('Division Gamma')).toBeVisible()

      // Small Conference has only 1 division
      await expect(page.getByText('Only Division')).toBeVisible()
    })

    test('renders teams in lopsided structure', async ({ page }) => {
      await page.goto('/leagues/2/structure')

      // Wait for page to load
      await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10000 })

      // Teams from Big Conference
      await expect(page.getByText('Alpha Team 1')).toBeVisible()
      await expect(page.getByText('Beta Team 1')).toBeVisible()
      await expect(page.getByText('Gamma Team 1')).toBeVisible()

      // Teams from Small Conference
      await expect(page.getByText('Solo Team 1')).toBeVisible()
    })
  })

  test.describe('Empty League (no conferences)', () => {
    test.beforeEach(async () => {
      await setScenario('getLeague', 'emptyLeague')
    })

    test('shows empty state when no conferences exist', async ({ page }) => {
      await page.goto('/leagues/3/structure')

      // Wait for page to load
      await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10000 })

      // Should show the league name
      await expect(page.getByText('Empty League')).toBeVisible()

      // Should show empty state or "add conference" prompt
      // The exact text depends on the UI implementation
      const addButton = page.getByRole('button', { name: /add.*conference/i })
      await expect(addButton).toBeVisible()
    })
  })
})
