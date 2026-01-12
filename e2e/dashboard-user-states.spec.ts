import { test, expect } from '@playwright/test';

const MOCK_SERVER = 'http://localhost:3001';

/**
 * Dashboard User States E2E Tests
 *
 * Tests the various user experiences on the dashboard based on their role and team assignments:
 *
 * User Scenarios (no commissioner role):
 * 1. No leagues, no teams - sees empty states with CTAs
 * 2. First team assigned (new) - sees team with "New" badge, welcome modal on click
 * 3. Multiple teams, one new - sees all teams, new one has badge
 *
 * Commissioner Scenarios:
 * 4. Commissioner, no teams - sees league, empty teams section
 * 5. Commissioner, first team (new) - sees league + team with "New" badge
 * 6. Commissioner, multiple teams, one new - sees league + all teams
 */

test.describe('Dashboard User States', () => {
  // Run tests serially to avoid preset conflicts on shared mock server
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ request }) => {
    // Reset mock server state before each test
    await request.post(`${MOCK_SERVER}/_reset`);
  });

  test.describe('User with No Leagues and No Teams', () => {
    test.beforeEach(async ({ request }) => {
      await request.post(`${MOCK_SERVER}/_preset`, {
        data: { name: 'new-user' }
      });
    });

    test('shows empty state for leagues with Create League CTA', async ({ page }) => {
      await page.goto('/dashboard');

      // Should see "No Leagues Yet" message
      await expect(page.getByText('No Leagues Yet')).toBeVisible();

      // Should see CTA to create first league
      const createLeagueLink = page.getByRole('link', { name: /create your first league/i });
      await expect(createLeagueLink).toBeVisible();
      await expect(createLeagueLink).toHaveAttribute('href', '/leagues/create');
    });

    test('shows empty state for teams with invitation info and Create League CTA', async ({ page }) => {
      await page.goto('/dashboard');

      // Should see "No Teams Assigned" message
      await expect(page.getByText('No Teams Assigned')).toBeVisible();

      // Should see explanation about waiting for commissioner invite
      await expect(page.getByText(/when a commissioner invites you/i)).toBeVisible();

      // Should see CTA to create own league
      const createLeagueLink = page.getByRole('link', { name: /create your own league/i });
      await expect(createLeagueLink).toBeVisible();
      await expect(createLeagueLink).toHaveAttribute('href', '/leagues/create');
    });

    test('both sections are visible with appropriate empty states', async ({ page }) => {
      await page.goto('/dashboard');

      // Wait for page to load
      await expect(page.getByRole('heading', { name: /your dashboard/i })).toBeVisible();

      // Both section headers should be visible
      await expect(page.getByText('Leagues You Manage')).toBeVisible();
      await expect(page.getByText('Teams You Manage')).toBeVisible();

      // Both empty states should be visible
      await expect(page.getByText('No Leagues Yet')).toBeVisible();
      await expect(page.getByText('No Teams Assigned')).toBeVisible();
    });
  });

  test.describe('User with First Team Assigned (New)', () => {
    test.beforeEach(async ({ request }) => {
      await request.post(`${MOCK_SERVER}/_preset`, {
        data: { name: 'user-first-team' }
      });
    });

    test('shows team with New badge', async ({ page }) => {
      await page.goto('/dashboard');

      // Should see the team name in main content (not nav context switcher)
      const main = page.getByRole('main');
      await expect(main.getByText('Eagles')).toBeVisible();

      // Should see "New" badge
      await expect(main.getByText('New')).toBeVisible();

      // Should see league name in parentheses
      await expect(main.getByText('(Test League)')).toBeVisible();
    });

    test('shows Pending control state indicator', async ({ page }) => {
      await page.goto('/dashboard');

      // Should see Pending status indicator
      await expect(page.getByLabel('Pending')).toBeVisible();
    });

    test('clicking team shows welcome modal', async ({ page }) => {
      await page.goto('/dashboard');

      // Wait for team to be visible in main content
      const main = page.getByRole('main');
      await expect(main.getByText('Eagles')).toBeVisible();

      // Click on the team name to trigger the modal (for unviewed teams)
      await main.getByText('Eagles').click();

      // Should see welcome modal
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('button', { name: /confirm/i })).toBeVisible();
    });

    test('still shows empty leagues section', async ({ page }) => {
      await page.goto('/dashboard');

      // Should still see no leagues empty state
      await expect(page.getByText('No Leagues Yet')).toBeVisible();
    });
  });

  test.describe('User with Multiple Teams, One New', () => {
    test.beforeEach(async ({ request }) => {
      await request.post(`${MOCK_SERVER}/_preset`, {
        data: { name: 'user-multiple-teams-one-new' }
      });
    });

    test('shows all teams', async ({ page }) => {
      await page.goto('/dashboard');

      // Should see all team names in main content
      const main = page.getByRole('main');
      await expect(main.getByText('Eagles')).toBeVisible();
      await expect(main.getByText('Cowboys')).toBeVisible();
      await expect(main.getByText('Giants')).toBeVisible();
    });

    test('shows New badge only on the new team', async ({ page }) => {
      await page.goto('/dashboard');

      // Should have exactly one "New" badge
      const newBadges = page.getByText('New');
      await expect(newBadges).toHaveCount(1);

      // The Giants team should have the New badge (it's the unviewed one)
      const giantsRow = page.locator('div').filter({ hasText: 'Giants' }).first();
      await expect(giantsRow.getByText('New')).toBeVisible();
    });

    test('shows Active status for viewed teams', async ({ page }) => {
      await page.goto('/dashboard');

      // Should see Active status indicators for viewed teams
      const activeLabels = page.getByLabel('Active');
      await expect(activeLabels).toHaveCount(2); // Eagles and Cowboys are active
    });

    test('clicking new team shows welcome modal', async ({ page }) => {
      await page.goto('/dashboard');

      // Click on the new team (Giants) in main content
      await page.getByRole('main').getByText('Giants').click();

      // Should see welcome modal
      await expect(page.getByText(/welcome/i)).toBeVisible();
    });

    test('clicking viewed team navigates directly to team manage page', async ({ page }) => {
      await page.goto('/dashboard');

      // Wait for teams to load in main content
      const main = page.getByRole('main');
      await expect(main.getByText('Eagles')).toBeVisible();

      // Click on a viewed team (Eagles) - clicking the team name navigates directly
      await main.getByText('Eagles').click();

      // Should navigate to team manage page (no modal)
      await expect(page).toHaveURL(/\/teams\/1\/manage/);
    });
  });

  test.describe('Commissioner with No Teams', () => {
    test.beforeEach(async ({ request }) => {
      await request.post(`${MOCK_SERVER}/_preset`, {
        data: { name: 'commissioner-no-teams' }
      });
    });

    test('shows league in Leagues You Manage section', async ({ page }) => {
      await page.goto('/dashboard');

      // Should see league name (use first() since there may be multiple leagues)
      await expect(page.getByText('Test League').first()).toBeVisible();

      // Should see Manage button (use first() for strict mode)
      await expect(page.getByRole('link', { name: /manage/i }).first()).toBeVisible();
    });

    test('shows Create League button when leagues exist', async ({ page }) => {
      await page.goto('/dashboard');

      // Should see "+ Create League" button
      await expect(page.getByRole('link', { name: /\+ create league/i })).toBeVisible();
    });

    test('shows empty teams section with invitation info', async ({ page }) => {
      await page.goto('/dashboard');

      // Should see empty teams state
      await expect(page.getByText('No Teams Assigned')).toBeVisible();
      await expect(page.getByText(/when a commissioner invites you/i)).toBeVisible();
    });

    test('league Manage link navigates to league manage page', async ({ page }) => {
      await page.goto('/dashboard');

      // Click manage link
      await page.getByRole('link', { name: /manage/i }).first().click();

      // Should navigate to league manage page
      await expect(page).toHaveURL(/\/leagues\/\d+\/manage/);
    });
  });

  test.describe('Commissioner with First Team Assigned (New)', () => {
    test.beforeEach(async ({ request }) => {
      await request.post(`${MOCK_SERVER}/_preset`, {
        data: { name: 'commissioner-first-team' }
      });
    });

    test('shows both league and team', async ({ page }) => {
      await page.goto('/dashboard');

      // Should see league and team in main content
      const main = page.getByRole('main');
      await expect(main.getByText('Test League').first()).toBeVisible();
      await expect(main.getByText('Eagles')).toBeVisible();
    });

    test('team has New badge', async ({ page }) => {
      await page.goto('/dashboard');

      // Should see New badge on team
      await expect(page.getByText('New')).toBeVisible();
    });

    test('clicking team shows welcome modal', async ({ page }) => {
      await page.goto('/dashboard');

      // Click on team in main content
      const main = page.getByRole('main');
      await main.getByText('Eagles').click();

      // Should see welcome modal
      await expect(page.getByText(/welcome/i)).toBeVisible();
    });
  });

  test.describe('Commissioner with Multiple Teams, One New', () => {
    test.beforeEach(async ({ request }) => {
      await request.post(`${MOCK_SERVER}/_preset`, {
        data: { name: 'commissioner-multiple-teams-one-new' }
      });
    });

    test('shows league and all teams', async ({ page }) => {
      await page.goto('/dashboard');

      // Should see league and all teams in main content
      const main = page.getByRole('main');
      await expect(main.getByText('Test League').first()).toBeVisible();
      await expect(main.getByText('Eagles')).toBeVisible();
      await expect(main.getByText('Cowboys')).toBeVisible();
      await expect(main.getByText('Giants')).toBeVisible();
    });

    test('only new team has New badge', async ({ page }) => {
      await page.goto('/dashboard');

      // Should have exactly one New badge
      await expect(page.getByText('New')).toHaveCount(1);
    });

    test('has both league Manage link and Create League button', async ({ page }) => {
      await page.goto('/dashboard');

      // Should have Manage link for existing league
      const manageLinks = page.getByRole('link', { name: /^manage$/i });
      await expect(manageLinks.first()).toBeVisible();

      // Should have Create League button
      await expect(page.getByRole('link', { name: /\+ create league/i })).toBeVisible();
    });

    test('welcome modal flow works for new team then navigates', async ({ page }) => {
      await page.goto('/dashboard');

      // Click new team in main content
      await page.getByRole('main').getByText('Giants').click();

      // See welcome modal
      await expect(page.getByText(/welcome/i)).toBeVisible();

      // Click confirm to take control
      await page.getByRole('button', { name: /confirm/i }).click();

      // Should navigate to team manage page
      await expect(page).toHaveURL(/\/teams\/3\/manage/);
    });
  });
});
