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

    // Can navigate to Teams (which loads from API)
    await page.click('text=Teams')
    await expect(page).toHaveURL('/teams')
    await expect(page.getByRole('heading', { name: 'Teams' })).toBeVisible()

    // Can navigate to Leagues
    await page.click('text=Leagues')
    await expect(page).toHaveURL('/leagues')
    await expect(page.getByRole('heading', { name: 'My Leagues' })).toBeVisible()

    // Can navigate to Profile
    await page.click('text=Profile')
    await expect(page).toHaveURL('/profile')
    await expect(page.getByRole('heading', { name: 'User Profile' })).toBeVisible()
  })

  test('User Journey: Create, view, and delete a league', async ({ page }) => {
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
    await page.locator('input[placeholder="Enter league name"]').fill(leagueName)
    
    // Use the number inputs for structure
    await page.locator('input#conferences').fill('1')
    await page.locator('input#divisionsPerConference').fill('1')
    await page.locator('input#teamsPerDivision').fill('2')
    
    // Submit the form
    await page.getByRole('button', { name: /Create League/i }).click()

    // Should navigate to structure page
    await page.waitForURL('**/structure', { timeout: 10000 })
    await expect(page.getByText(leagueName)).toBeVisible()

    // Navigate back to leagues list
    await page.goto('/leagues')
    await expect(page.getByText(leagueName).first()).toBeVisible({ timeout: 10000 })

    // Click on the league to view details
    await page.getByText(leagueName).first().click()
    await expect(page.getByText(leagueName)).toBeVisible()

    // Verify league structure is visible
    await expect(page.getByText(leagueName)).toBeVisible()
    
    // TODO: Add delete functionality test when implemented
    // For now, just verify we can navigate to structure page
    await expect(page.getByText('Conference 1')).toBeVisible()
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
