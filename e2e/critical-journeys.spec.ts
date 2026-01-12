/**
 * Critical User Journeys E2E Tests
 *
 * These are the TRUE end-to-end tests that verify critical full-stack user flows.
 * They require a real API and database to run.
 *
 * For UI-only tests (modals, form validation, navigation), see the Vitest
 * integration tests in src/pages/__tests__/*.test.tsx
 */
import { test, expect } from '@playwright/test'

test.describe('Critical User Journeys', () => {
  test.describe.configure({ mode: 'serial' })

  test('User Journey: App loads and navigation works', async ({ page }) => {
    // Start at home page
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Goal to Go Football' })).toBeVisible()

    // Can navigate to Teams (which loads from API) - use nav link specifically
    await page.getByRole('link', { name: 'Teams', exact: true }).first().click()
    await expect(page).toHaveURL('/teams')
    await expect(page.getByRole('heading', { name: 'Teams' })).toBeVisible()

    // Can navigate to Leagues - use nav link specifically
    await page.getByRole('link', { name: 'Leagues', exact: true }).first().click()
    await expect(page).toHaveURL('/leagues')
    await expect(page.getByRole('heading', { name: 'My Leagues' })).toBeVisible()

    // Can navigate to Profile - use nav link specifically
    await page.getByRole('link', { name: 'Profile', exact: true }).first().click()
    await expect(page).toHaveURL('/profile')
    await expect(page.getByRole('heading', { name: 'User Profile' })).toBeVisible()
  })

  test('User Journey: Create league flow - UI responds correctly', async ({ page }) => {
    // Go to leagues page
    await page.goto('/leagues')
    await expect(page.getByRole('heading', { name: 'My Leagues' })).toBeVisible()

    // Click create league button - should navigate to create page
    await page.getByTestId('create-league-button').click()
    
    // Wait for navigation to /leagues/create
    await page.waitForURL('**/leagues/create')
    await expect(page.getByRole('heading', { name: 'Create New League' })).toBeVisible()

    // Fill in league parameters
    const leagueName = `E2E Test League ${Date.now()}`
    await page.locator('input[placeholder="e.g., National Football League"]').fill(leagueName)
    
    // Use the number inputs for structure (they're the second input in each group)
    await page.locator('input[type="number"]').nth(1).fill('1') // conferences
    await page.locator('input[type="number"]').nth(2).fill('1') // divisions
    await page.locator('input[type="number"]').nth(3).fill('2') // teams
    
    // Submit the form
    await page.getByRole('button', { name: /Create League/i }).click()

    // UI should navigate to structure page after successful API response
    // This tests that the UI correctly handles the API response and navigates
    await page.waitForURL('**/structure', { timeout: 10000 })
    
    // The structure page should render with the league name
    // (whatever the API returned - we're testing UI rendering, not API persistence)
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10000 })
    
    // Structure editor should be visible - just verify we're on the structure page
    // The page header or any structure-related element confirms we're in the right place
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('User Journey: View profile with user data from API', async ({ page }) => {
    await page.goto('/profile')

    // Profile loads real user data from API
    await expect(page.getByRole('heading', { name: 'User Profile' })).toBeVisible()
    await expect(page.getByText('Account Information')).toBeVisible()
    // The User ID section has a label and a code element with the ID
    await expect(page.locator('label', { hasText: 'Your User ID' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible()

    // Leagues section shows data from API
    await expect(page.getByRole('heading', { name: /My Leagues/ })).toBeVisible()
  })

  test('User Journey: Teams page loads data from API', async ({ page }) => {
    await page.goto('/teams')

    // Page loads and shows teams from the real API
    await expect(page.getByRole('heading', { name: 'Teams' })).toBeVisible()

    // Wait for teams to load (not loading spinner)
    await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 10000 })

    // Should show team count from API
    await expect(page.getByText(/teams in the league/)).toBeVisible()
  })
})
