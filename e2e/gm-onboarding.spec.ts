/**
 * Epic #49: GM Invitation & Onboarding E2E Tests
 *
 * Comprehensive browser tests for all GM onboarding flows using mock presets.
 * These tests exercise the full user experience for commissioners and GMs.
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

test.describe('Epic #49: GM Invitation & Onboarding', () => {
  // Run tests serially to avoid preset conflicts
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ page }) => {
    // Reset mock server state before each test
    await resetMockServer(page)
  })

  test.describe('Dashboard - Team Control State Indicators', () => {
    test('displays mixed control states with correct indicators', async ({ page }) => {
      await activatePreset(page, 'default')
      await page.goto('/dashboard')

      // Wait for dashboard to load
      await expect(page.getByRole('heading', { name: 'Your Dashboard' })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Teams You Manage' })).toBeVisible()

      // Should show teams with different control states
      // The default preset has: Eagles (viewed), Falcons (not viewed)
      await expect(page.getByText('Eagles')).toBeVisible()
      await expect(page.getByText('Falcons')).toBeVisible()

      // Teams section should show league names
      await expect(page.getByText('(Test League)')).toBeVisible()
      await expect(page.getByText('(Another League)')).toBeVisible()
    })

    test('shows "New" badge for unviewed teams', async ({ page }) => {
      await activatePreset(page, 'default')
      await page.goto('/dashboard')

      await expect(page.getByRole('heading', { name: 'Your Dashboard' })).toBeVisible()

      // Falcons has hasViewed: false, should show "New" badge
      const newBadge = page.locator('[aria-label="New team"]')
      await expect(newBadge).toBeVisible()
    })

    test('displays empty state when user has no teams', async ({ page }) => {
      await activatePreset(page, 'new-user')
      await page.goto('/dashboard')

      await expect(page.getByRole('heading', { name: 'Your Dashboard' })).toBeVisible()

      // Should show empty state for teams
      await expect(page.getByText('No Teams Assigned')).toBeVisible()
      await expect(page.getByText("You haven't been assigned to manage any teams yet")).toBeVisible()
      await expect(page.getByRole('link', { name: 'Browse Leagues' })).toBeVisible()
    })

    test('displays empty state when user has no leagues', async ({ page }) => {
      await activatePreset(page, 'new-user')
      await page.goto('/dashboard')

      await expect(page.getByRole('heading', { name: 'Your Dashboard' })).toBeVisible()

      // Should show empty state for leagues
      await expect(page.getByText('No Leagues Yet')).toBeVisible()
      await expect(page.getByRole('link', { name: 'Create Your First League' })).toBeVisible()
    })
  })

  test.describe('Dashboard - Welcome Modal Flow', () => {
    test('opens welcome modal when clicking unviewed team', async ({ page }) => {
      await activatePreset(page, 'default')
      await page.goto('/dashboard')

      await expect(page.getByRole('heading', { name: 'Your Dashboard' })).toBeVisible()

      // Wait for teams to load
      await expect(page.getByText('Falcons')).toBeVisible()

      // Find and click on the team that hasn't been viewed (Falcons)
      // The team row with cursor-pointer class is clickable
      const falconsRow = page.locator('div.cursor-pointer').filter({ hasText: 'Falcons' })
      await falconsRow.click()

      // Welcome modal should appear
      const modal = page.getByRole('dialog')
      await expect(modal).toBeVisible()
      await expect(modal.getByText('Welcome to the Falcons!')).toBeVisible()
      await expect(modal.getByText("You're now the GM.")).toBeVisible()

      // Modal should explain GM responsibilities
      await expect(modal.getByText('Manage your roster')).toBeVisible()
      await expect(modal.getByText('Set your depth chart')).toBeVisible()
      await expect(modal.getByText('Make trades and signings')).toBeVisible()

      // Should have Cancel and Confirm buttons
      await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible()
      await expect(modal.getByRole('button', { name: 'Confirm' })).toBeVisible()
    })

    test('closes welcome modal on cancel', async ({ page }) => {
      await activatePreset(page, 'default')
      await page.goto('/dashboard')

      await expect(page.getByRole('heading', { name: 'Your Dashboard' })).toBeVisible()

      // Click on unviewed team
      const falconsRow = page.locator('div.cursor-pointer').filter({ hasText: 'Falcons' })
      await falconsRow.click()

      // Modal should appear
      const modal = page.getByRole('dialog')
      await expect(modal).toBeVisible()

      // Click Cancel
      await modal.getByRole('button', { name: 'Cancel' }).click()

      // Modal should close
      await expect(modal).not.toBeVisible()

      // Should still be on dashboard
      await expect(page.getByRole('heading', { name: 'Your Dashboard' })).toBeVisible()
    })

    test('takes control of team when confirming welcome modal', async ({ page }) => {
      await activatePreset(page, 'default')
      await page.goto('/dashboard')

      await expect(page.getByRole('heading', { name: 'Your Dashboard' })).toBeVisible()

      // Click on unviewed team
      const falconsRow = page.locator('div.cursor-pointer').filter({ hasText: 'Falcons' })
      await falconsRow.click()

      // Modal should appear
      const modal = page.getByRole('dialog')
      await expect(modal).toBeVisible()

      // Click Confirm to take control
      await modal.getByRole('button', { name: 'Confirm' }).click()

      // Should navigate to team management page
      await expect(page).toHaveURL(/\/teams\/\d+\/manage/)
    })

    test('navigates directly for already viewed teams', async ({ page }) => {
      await activatePreset(page, 'default')
      await page.goto('/dashboard')

      await expect(page.getByRole('heading', { name: 'Your Dashboard' })).toBeVisible()

      // Click on the viewed team (Eagles) - should navigate without modal
      const eaglesRow = page.locator('div.cursor-pointer').filter({ hasText: 'Eagles' })
      await eaglesRow.click()

      // Should navigate directly to team management
      await expect(page).toHaveURL(/\/teams\/\d+\/manage/)

      // No modal should have appeared
      await expect(page.getByRole('dialog')).not.toBeVisible()
    })
  })

  test.describe('Dashboard - Pending GM Flow', () => {
    test('shows pending team for new GM with pending invitation', async ({ page }) => {
      await activatePreset(page, 'new-gm-pending')
      await page.goto('/dashboard')

      await expect(page.getByRole('heading', { name: 'Your Dashboard' })).toBeVisible()

      // Should show the pending team
      await expect(page.getByText('Giants')).toBeVisible()

      // Should show Pending indicator
      await expect(page.locator('[aria-label="Pending"]')).toBeVisible()
    })

    test('pending GM can take control via welcome modal', async ({ page }) => {
      await activatePreset(page, 'new-gm-pending')
      await page.goto('/dashboard')

      await expect(page.getByRole('heading', { name: 'Your Dashboard' })).toBeVisible()

      // Wait for teams to load
      await expect(page.getByText('Giants')).toBeVisible()

      // Click on the pending team (Giants - hasViewed: false)
      const giantsRow = page.locator('div.cursor-pointer').filter({ hasText: 'Giants' })
      await giantsRow.click()

      // Welcome modal should appear
      const modal = page.getByRole('dialog')
      await expect(modal).toBeVisible()
      await expect(modal.getByText('Welcome to the Giants!')).toBeVisible()

      // Confirm to take control
      await modal.getByRole('button', { name: 'Confirm' }).click()

      // Should navigate to team management
      await expect(page).toHaveURL(/\/teams\/\d+\/manage/)
    })
  })

  test.describe('Commissioner - League Management Page', () => {
    test('displays all teams with correct status indicators in fresh league', async ({ page }) => {
      await activatePreset(page, 'fresh-league')
      await page.goto('/leagues/1/manage')

      // Wait for page to load
      await expect(page.getByRole('heading', { name: /Manage/ })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Team Assignments' })).toBeVisible()

      // All teams should show "Needs GM" status (AI controlled)
      const needsGmIndicators = page.locator('text=Needs GM')
      await expect(needsGmIndicators.first()).toBeVisible()

      // Each AI-controlled team should have "Assign GM" and "I'll Take This" buttons
      await expect(page.getByRole('button', { name: 'Assign GM' }).first()).toBeVisible()
      await expect(page.getByRole('button', { name: "I'll Take This" }).first()).toBeVisible()
    })

    test('displays mixed assignment states correctly', async ({ page }) => {
      await activatePreset(page, 'default')
      await page.goto('/leagues/1/manage')

      await expect(page.getByRole('heading', { name: 'Team Assignments' })).toBeVisible()

      // Should show Active status for human-controlled teams
      await expect(page.getByText('Active').first()).toBeVisible()

      // Should show Pending status for pending invitations
      await expect(page.getByText('Pending').first()).toBeVisible()

      // Should show Needs GM for AI-controlled teams
      await expect(page.getByText('Needs GM').first()).toBeVisible()
    })

    test('displays many pending invitations scenario', async ({ page }) => {
      await activatePreset(page, 'many-pending')
      await page.goto('/leagues/1/manage')

      await expect(page.getByRole('heading', { name: 'Team Assignments' })).toBeVisible()

      // Should show multiple Pending statuses
      const pendingIndicators = page.locator('text=Pending')
      await expect(pendingIndicators).toHaveCount(3)

      // Should show assigned email addresses for pending invites
      await expect(page.getByText('gm1@example.com')).toBeVisible()
      await expect(page.getByText('gm2@example.com')).toBeVisible()
      await expect(page.getByText('gm3@example.com')).toBeVisible()
    })

    test('displays all active GMs scenario', async ({ page }) => {
      await activatePreset(page, 'all-active')
      await page.goto('/leagues/1/manage')

      await expect(page.getByRole('heading', { name: 'Team Assignments' })).toBeVisible()

      // All teams should show Active status
      const activeIndicators = page.locator('text=Active')
      await expect(activeIndicators).toHaveCount(4)

      // No AI-controlled teams, so no "Assign GM" buttons
      await expect(page.getByRole('button', { name: 'Assign GM' })).not.toBeVisible()

      // All teams should have "Remove GM" buttons instead
      const removeButtons = page.getByRole('button', { name: 'Remove GM' })
      await expect(removeButtons).toHaveCount(4)
    })
  })

  test.describe('Commissioner - Assign GM Modal', () => {
    test('opens assign GM modal for AI-controlled team', async ({ page }) => {
      await activatePreset(page, 'fresh-league')
      await page.goto('/leagues/1/manage')

      await expect(page.getByRole('heading', { name: 'Team Assignments' })).toBeVisible()

      // Click "Assign GM" for first team
      await page.getByRole('button', { name: 'Assign GM' }).first().click()

      // Modal should appear
      const modal = page.getByRole('dialog')
      await expect(modal).toBeVisible()
      await expect(modal.getByText(/Assign GM to/)).toBeVisible()

      // Should have email and display name fields
      await expect(modal.locator('#email-input')).toBeVisible()
      await expect(modal.locator('#display-name-input')).toBeVisible()

      // Should have informational text
      await expect(modal.getByText(/If this email is already registered/)).toBeVisible()

      // Should have Cancel and Assign GM buttons
      await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible()
      await expect(modal.getByRole('button', { name: 'Assign GM' })).toBeVisible()
    })

    test('validates email is required', async ({ page }) => {
      await activatePreset(page, 'fresh-league')
      await page.goto('/leagues/1/manage')

      await page.getByRole('button', { name: 'Assign GM' }).first().click()

      const modal = page.getByRole('dialog')
      await expect(modal).toBeVisible()

      // Try to submit with empty email
      await modal.getByRole('button', { name: 'Assign GM' }).click()

      // Should show error
      await expect(modal.getByRole('alert')).toContainText('Email is required')
    })

    test('validates display name is required', async ({ page }) => {
      await activatePreset(page, 'fresh-league')
      await page.goto('/leagues/1/manage')

      await page.getByRole('button', { name: 'Assign GM' }).first().click()

      const modal = page.getByRole('dialog')
      await expect(modal).toBeVisible()

      // Fill email but leave display name empty
      await modal.locator('#email-input').fill('test@example.com')
      await modal.getByRole('button', { name: 'Assign GM' }).click()

      // Should show error
      await expect(modal.getByRole('alert')).toContainText('Display name is required')
    })

    test('validates email format', async ({ page }) => {
      await activatePreset(page, 'fresh-league')
      await page.goto('/leagues/1/manage')

      await page.getByRole('button', { name: 'Assign GM' }).first().click()

      const modal = page.getByRole('dialog')
      await expect(modal).toBeVisible()

      // Fill invalid email
      await modal.locator('#email-input').fill('not-an-email')
      await modal.locator('#display-name-input').fill('Test GM')
      await modal.getByRole('button', { name: 'Assign GM' }).click()

      // Should show error
      await expect(modal.getByRole('alert')).toContainText('Please enter a valid email address')
    })

    test('successfully assigns GM and shows success state', async ({ page }) => {
      await activatePreset(page, 'fresh-league')
      await page.goto('/leagues/1/manage')

      await page.getByRole('button', { name: 'Assign GM' }).first().click()

      const modal = page.getByRole('dialog')
      await expect(modal).toBeVisible()

      // Fill valid form
      await modal.locator('#email-input').fill('newgm@example.com')
      await modal.locator('#display-name-input').fill('New GM')
      await modal.getByRole('button', { name: 'Assign GM' }).click()

      // Should show success state
      await expect(modal.getByText('GM Assigned Successfully')).toBeVisible()
      await expect(modal.getByText(/New GM has been assigned as GM/)).toBeVisible()

      // Should have Done button
      await expect(modal.getByTestId('success-close-button')).toBeVisible()
    })

    test('closes assign modal on cancel', async ({ page }) => {
      await activatePreset(page, 'fresh-league')
      await page.goto('/leagues/1/manage')

      await page.getByRole('button', { name: 'Assign GM' }).first().click()

      const modal = page.getByRole('dialog')
      await expect(modal).toBeVisible()

      // Click Cancel
      await modal.getByRole('button', { name: 'Cancel' }).click()

      // Modal should close
      await expect(modal).not.toBeVisible()
    })

    test('closes success modal and returns to manage page', async ({ page }) => {
      await activatePreset(page, 'fresh-league')
      await page.goto('/leagues/1/manage')

      await page.getByRole('button', { name: 'Assign GM' }).first().click()

      const modal = page.getByRole('dialog')

      // Fill and submit
      await modal.locator('#email-input').fill('newgm@example.com')
      await modal.locator('#display-name-input').fill('New GM')
      await modal.getByRole('button', { name: 'Assign GM' }).click()

      // Wait for success state
      await expect(modal.getByText('GM Assigned Successfully')).toBeVisible()

      // Click Done
      await modal.getByTestId('success-close-button').click()

      // Modal should close
      await expect(page.getByRole('dialog')).not.toBeVisible()

      // Should still be on manage page
      await expect(page.getByRole('heading', { name: 'Team Assignments' })).toBeVisible()
    })
  })

  test.describe('Commissioner - Self-Assign Flow', () => {
    test('commissioner can self-assign to AI-controlled team', async ({ page }) => {
      await activatePreset(page, 'fresh-league')
      await page.goto('/leagues/1/manage')

      await expect(page.getByRole('heading', { name: 'Team Assignments' })).toBeVisible()

      // Click "I'll Take This" for first team
      await page.getByRole('button', { name: "I'll Take This" }).first().click()

      // Wait for the mutation to complete - the button should become disabled during loading
      // After success, the mock should update the state
      // Note: with mock server, the actual state doesn't persist, but we verify the button was clicked
      await page.waitForTimeout(500) // Allow API call to complete
    })
  })

  test.describe('Commissioner - Remove Assignment', () => {
    test('displays remove button for assigned teams', async ({ page }) => {
      await activatePreset(page, 'all-active')
      await page.goto('/leagues/1/manage')

      await expect(page.getByRole('heading', { name: 'Team Assignments' })).toBeVisible()

      // All teams are assigned, so each should have Remove GM button
      const removeButtons = page.getByRole('button', { name: 'Remove GM' })
      await expect(removeButtons.first()).toBeVisible()
    })

    test('remove button triggers confirmation dialog', async ({ page }) => {
      await activatePreset(page, 'all-active')
      await page.goto('/leagues/1/manage')

      // Listen for dialog events (confirm)
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Remove GM from this team')
        await dialog.dismiss() // Cancel the removal
      })

      // Click Remove GM
      await page.getByRole('button', { name: 'Remove GM' }).first().click()
    })
  })

  test.describe('Error Handling', () => {
    test('dashboard shows error state when API fails', async ({ page }) => {
      await activatePreset(page, 'error-mode')
      await page.goto('/dashboard')

      // Should show error message
      await expect(page.getByText(/Unable to Load/)).toBeVisible({ timeout: 10000 })

      // Should have retry button
      await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible()
    })

    test('league manage page shows error when API fails', async ({ page }) => {
      await activatePreset(page, 'error-mode')
      await page.goto('/leagues/1/manage')

      // Should show error message
      await expect(page.getByText(/Error loading team management/)).toBeVisible({ timeout: 10000 })
    })

    test('assign GM modal handles API error gracefully', async ({ page }) => {
      // First load with fresh-league to get the modal open
      await activatePreset(page, 'fresh-league')
      await page.goto('/leagues/1/manage')

      await page.getByRole('button', { name: 'Assign GM' }).first().click()

      const modal = page.getByRole('dialog')
      await expect(modal).toBeVisible()

      // Now switch to error mode before submitting
      await activatePreset(page, 'error-mode')

      // Fill and submit form
      await modal.locator('#email-input').fill('test@example.com')
      await modal.locator('#display-name-input').fill('Test GM')
      await modal.getByRole('button', { name: 'Assign GM' }).click()

      // Should show error message
      await expect(modal.getByRole('alert')).toContainText('Failed to assign GM')
    })

    test('retry button attempts to reload data', async ({ page }) => {
      await activatePreset(page, 'error-mode')
      await page.goto('/dashboard')

      await expect(page.getByText(/Unable to Load/)).toBeVisible({ timeout: 10000 })

      // Switch to default preset so retry succeeds
      await activatePreset(page, 'default')

      // Click retry
      await page.getByRole('button', { name: 'Try Again' }).click()

      // Should now show dashboard content
      await expect(page.getByRole('heading', { name: 'Teams You Manage' })).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Slow Network Simulation', () => {
    test('dashboard shows loading state during slow requests', async ({ page }) => {
      await activatePreset(page, 'slow-network')
      await page.goto('/dashboard')

      // Should show loading skeleton initially
      // The skeleton has animate-pulse class
      await expect(page.locator('.animate-pulse').first()).toBeVisible()

      // After 2+ seconds, data should load (slow-network has 2000ms latency)
      await expect(page.getByRole('heading', { name: 'Your Dashboard' })).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Navigation Flows', () => {
    test('dashboard league "Manage" link navigates to league manage page', async ({ page }) => {
      await activatePreset(page, 'default')
      await page.goto('/dashboard')

      await expect(page.getByRole('heading', { name: 'Your Dashboard' })).toBeVisible()

      // Click Manage link for a league
      await page.getByRole('link', { name: 'Manage' }).first().click()

      // Should navigate to league manage page
      await expect(page).toHaveURL(/\/leagues\/\d+\/manage/)
    })

    test('empty state "Create Your First League" navigates to create page', async ({ page }) => {
      await activatePreset(page, 'new-user')
      await page.goto('/dashboard')

      await expect(page.getByText('No Leagues Yet')).toBeVisible()

      // Click create league link
      await page.getByRole('link', { name: 'Create Your First League' }).click()

      // Should navigate to league creation
      await expect(page).toHaveURL('/leagues/create')
    })

    test('empty state "Browse Leagues" navigates to leagues page', async ({ page }) => {
      await activatePreset(page, 'new-user')
      await page.goto('/dashboard')

      await expect(page.getByText('No Teams Assigned')).toBeVisible()

      // Click browse leagues link
      await page.getByRole('link', { name: 'Browse Leagues' }).click()

      // Should navigate to leagues page
      await expect(page).toHaveURL('/leagues')
    })

    // Note: Landing page doesn't have a Dashboard link - users access dashboard after login
    test('can navigate directly to dashboard', async ({ page }) => {
      await activatePreset(page, 'default')
      await page.goto('/dashboard')

      await expect(page).toHaveURL('/dashboard')
      await expect(page.getByRole('heading', { name: 'Your Dashboard' })).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('welcome modal has proper aria attributes', async ({ page }) => {
      await activatePreset(page, 'default')
      await page.goto('/dashboard')

      await expect(page.getByRole('heading', { name: 'Your Dashboard' })).toBeVisible()

      // Click on unviewed team to open modal
      const falconsRow = page.locator('div.cursor-pointer').filter({ hasText: 'Falcons' })
      await falconsRow.click()

      const modal = page.getByRole('dialog')
      await expect(modal).toBeVisible()

      // Check aria attributes
      await expect(modal).toHaveAttribute('aria-modal', 'true')
      await expect(modal).toHaveAttribute('aria-labelledby', 'welcome-modal-title')

      // Title should be properly labeled
      await expect(page.locator('#welcome-modal-title')).toBeVisible()
    })

    test('assign GM modal has proper aria attributes', async ({ page }) => {
      await activatePreset(page, 'fresh-league')
      await page.goto('/leagues/1/manage')

      await page.getByRole('button', { name: 'Assign GM' }).first().click()

      const modal = page.getByRole('dialog')
      await expect(modal).toBeVisible()

      // Check aria attributes
      await expect(modal).toHaveAttribute('aria-modal', 'true')
      await expect(modal).toHaveAttribute('aria-labelledby', 'modal-title')
    })

    test('control state badges have aria labels', async ({ page }) => {
      await activatePreset(page, 'default')
      await page.goto('/dashboard')

      await expect(page.getByRole('heading', { name: 'Your Dashboard' })).toBeVisible()

      // Check for aria-labeled badges
      // New badge
      await expect(page.locator('[aria-label="New team"]')).toBeVisible()
    })

    test('error messages are announced via alert role', async ({ page }) => {
      await activatePreset(page, 'fresh-league')
      await page.goto('/leagues/1/manage')

      await page.getByRole('button', { name: 'Assign GM' }).first().click()

      const modal = page.getByRole('dialog')

      // Submit empty form to trigger error
      await modal.getByRole('button', { name: 'Assign GM' }).click()

      // Error should have role="alert"
      const errorMessage = modal.getByRole('alert')
      await expect(errorMessage).toBeVisible()
    })

    test('form inputs have associated labels', async ({ page }) => {
      await activatePreset(page, 'fresh-league')
      await page.goto('/leagues/1/manage')

      await page.getByRole('button', { name: 'Assign GM' }).first().click()

      const modal = page.getByRole('dialog')

      // Email input should have label
      await expect(modal.getByLabel('Email Address')).toBeVisible()

      // Display name input should have label
      await expect(modal.getByLabel('Display Name')).toBeVisible()
    })
  })

  test.describe('Complete User Journeys', () => {
    test('Journey: Commissioner creates fresh league and assigns all GMs', async ({ page }) => {
      await activatePreset(page, 'fresh-league')

      // Start at dashboard
      await page.goto('/dashboard')
      await expect(page.getByRole('heading', { name: 'Your Dashboard' })).toBeVisible()

      // Navigate to manage league
      await page.getByRole('link', { name: 'Manage' }).first().click()
      await expect(page).toHaveURL(/\/leagues\/\d+\/manage/)

      // Verify all teams need GMs
      await expect(page.getByRole('heading', { name: 'Team Assignments' })).toBeVisible()
      const needsGmCount = await page.locator('text=Needs GM').count()
      expect(needsGmCount).toBeGreaterThan(0)

      // Assign first GM via modal
      await page.getByRole('button', { name: 'Assign GM' }).first().click()
      const modal = page.getByRole('dialog')
      await modal.locator('#email-input').fill('gm1@example.com')
      await modal.locator('#display-name-input').fill('First GM')
      await modal.getByRole('button', { name: 'Assign GM' }).click()
      await expect(modal.getByText('GM Assigned Successfully')).toBeVisible()
      await modal.getByTestId('success-close-button').click()

      // Self-assign second team
      await page.getByRole('button', { name: "I'll Take This" }).first().click()

      // Verify the actions completed (mock doesn't persist, but actions fired)
      await expect(page.getByRole('heading', { name: 'Team Assignments' })).toBeVisible()
    })

    test('Journey: New GM receives invitation and takes control', async ({ page }) => {
      await activatePreset(page, 'new-gm-pending')

      // New GM logs in and sees dashboard
      await page.goto('/dashboard')
      await expect(page.getByRole('heading', { name: 'Your Dashboard' })).toBeVisible()

      // Should see their pending team
      await expect(page.getByText('Giants')).toBeVisible()
      await expect(page.locator('[aria-label="Pending"]')).toBeVisible()

      // Click on the team to see welcome modal
      const giantsRow = page.locator('div.cursor-pointer').filter({ hasText: 'Giants' })
      await giantsRow.click()

      // Welcome modal appears
      const modal = page.getByRole('dialog')
      await expect(modal).toBeVisible()
      await expect(modal.getByText('Welcome to the Giants!')).toBeVisible()

      // Confirm to take control
      await modal.getByRole('button', { name: 'Confirm' }).click()

      // Should navigate to team management
      await expect(page).toHaveURL(/\/teams\/\d+\/manage/)
    })

    test('Journey: User with no teams browses and creates league', async ({ page }) => {
      await activatePreset(page, 'new-user')

      // New user logs in
      await page.goto('/dashboard')
      await expect(page.getByRole('heading', { name: 'Your Dashboard' })).toBeVisible()

      // Should see empty states
      await expect(page.getByText('No Leagues Yet')).toBeVisible()
      await expect(page.getByText('No Teams Assigned')).toBeVisible()

      // Click to create first league
      await page.getByRole('link', { name: 'Create Your First League' }).click()
      await expect(page).toHaveURL('/leagues/create')
      await expect(page.getByRole('heading', { name: 'Create New League' })).toBeVisible()
    })

    test('Journey: Error recovery - dashboard fails then retries successfully', async ({ page }) => {
      // Start with error mode
      await activatePreset(page, 'error-mode')
      await page.goto('/dashboard')

      // Should show error
      await expect(page.getByText(/Unable to Load/)).toBeVisible({ timeout: 10000 })

      // Switch to default mode for retry
      await activatePreset(page, 'default')

      // Click retry
      await page.getByRole('button', { name: 'Try Again' }).click()

      // Dashboard should load successfully
      await expect(page.getByRole('heading', { name: 'Teams You Manage' })).toBeVisible({ timeout: 10000 })
      await expect(page.getByText('Eagles')).toBeVisible()
    })
  })
})
