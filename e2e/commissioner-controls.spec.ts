/**
 * Commissioner Controls E2E Tests
 *
 * Tests the commissioner control panel on the Season Dashboard,
 * including the new "Advance by X Days" functionality.
 */
import { test, expect } from '@playwright/test'

test.describe('Commissioner Controls - Advance by Days', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page }) => {
    // Navigate to a league's season dashboard
    // Using league ID 1 which should exist in the mock data
    await page.goto('/leagues/1/season')

    // Wait for the page to load
    await expect(page.getByRole('heading', { name: 'Season Dashboard' })).toBeVisible({
      timeout: 10000,
    })
  })

  test('should display Commissioner Controls panel', async ({ page }) => {
    // Commissioner Controls heading should be visible
    await expect(page.getByRole('heading', { name: 'Commissioner Controls' })).toBeVisible()
  })

  test('should display advance by days controls', async ({ page }) => {
    // Look for the advance days controls using data-testid
    const advanceDaysControls = page.getByTestId('advance-days-controls')
    await expect(advanceDaysControls).toBeVisible()

    // Days input should be visible with default value
    const daysInput = page.getByTestId('days-input')
    await expect(daysInput).toBeVisible()
    await expect(daysInput).toHaveValue('7')
  })

  test('should display quick-select buttons for common day values', async ({ page }) => {
    // Quick select buttons for 1, 3, and 7 days
    await expect(page.getByTestId('quick-days-1')).toBeVisible()
    await expect(page.getByTestId('quick-days-3')).toBeVisible()
    await expect(page.getByTestId('quick-days-7')).toBeVisible()

    // Check button labels
    await expect(page.getByTestId('quick-days-1')).toContainText('1 day')
    await expect(page.getByTestId('quick-days-3')).toContainText('3 days')
    await expect(page.getByTestId('quick-days-7')).toContainText('7 days')
  })

  test('should update days input when quick-select button is clicked', async ({ page }) => {
    const daysInput = page.getByTestId('days-input')

    // Click 1 day button
    await page.getByTestId('quick-days-1').click()
    await expect(daysInput).toHaveValue('1')

    // Click 3 days button
    await page.getByTestId('quick-days-3').click()
    await expect(daysInput).toHaveValue('3')

    // Click 7 days button
    await page.getByTestId('quick-days-7').click()
    await expect(daysInput).toHaveValue('7')
  })

  test('should update button text based on days value', async ({ page }) => {
    const advanceButton = page.getByTestId('advance-days-button')

    // Default should show "Advance 7 days"
    await expect(advanceButton).toContainText('Advance 7 days')

    // Change to 1 day
    await page.getByTestId('quick-days-1').click()
    await expect(advanceButton).toContainText('Advance 1 day')

    // Change to 3 days
    await page.getByTestId('quick-days-3').click()
    await expect(advanceButton).toContainText('Advance 3 days')
  })

  test('should require confirmation before advancing', async ({ page }) => {
    // Click the advance button
    await page.getByTestId('advance-days-button').click()

    // Confirm button should appear
    const confirmButton = page.getByTestId('advance-days-confirm')
    await expect(confirmButton).toBeVisible()

    // Cancel button should also appear
    await expect(page.getByRole('button', { name: /Cancel/i })).toBeVisible()
  })

  test('should cancel confirmation when Cancel is clicked', async ({ page }) => {
    // Click advance button to enter confirmation mode
    await page.getByTestId('advance-days-button').click()
    await expect(page.getByTestId('advance-days-confirm')).toBeVisible()

    // Click cancel
    await page.getByRole('button', { name: /Cancel/i }).click()

    // Should return to normal state
    await expect(page.getByTestId('advance-days-button')).toBeVisible()
    await expect(page.getByTestId('advance-days-confirm')).not.toBeVisible()
  })

  test('should successfully advance by days on confirmation', async ({ page }) => {
    // Set to 3 days
    await page.getByTestId('quick-days-3').click()

    // Click advance button
    await page.getByTestId('advance-days-button').click()

    // Confirm the advance
    await page.getByTestId('advance-days-confirm').click()

    // The UI should reset after successful advance
    // (confirmation buttons should disappear)
    await expect(page.getByTestId('advance-days-button')).toBeVisible({ timeout: 5000 })
  })

  test('should allow manual days input', async ({ page }) => {
    const daysInput = page.getByTestId('days-input')

    // Clear and type a custom value
    await daysInput.fill('14')
    await expect(daysInput).toHaveValue('14')

    // Button should reflect the custom value
    await expect(page.getByTestId('advance-days-button')).toContainText('Advance 14 days')
  })

  test('should display Advance Full Week as secondary option', async ({ page }) => {
    // The full week button should be visible as a secondary option
    await expect(page.getByRole('button', { name: /Advance Full Week/i })).toBeVisible()
  })
})
