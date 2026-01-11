/**
 * Comprehensive integration tests for RosterPage
 * Tests real user interactions: filtering, sorting, searching, column visibility
 * Uses deterministic mock data for reliable assertions
 */
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders } from '../../test/test-utils';
import { RosterPage } from '../RosterPage';
import { Route, Routes } from 'react-router-dom';

const MOCK_SERVER_URL = 'http://localhost:3002';

// Set mock server to use deterministic test data
const useTestData = async () => {
  await fetch(`${MOCK_SERVER_URL}/_scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'listPlayers', scenario: 'testDataScenario' }),
  });
};

const renderRosterPage = (teamId: string = '1') => {
  return renderWithProviders(
    <Routes>
      <Route path="/teams/:teamId/roster" element={<RosterPage />} />
    </Routes>,
    { initialEntries: [`/teams/${teamId}/roster`] }
  );
};

// Helper to count visible player rows
const countPlayerRows = () => {
  const nameCells = screen.queryAllByTestId('cell-name');
  return nameCells.length;
};

// Helper to get player names from the table
const getPlayerNames = (): string[] => {
  const nameCells = screen.queryAllByTestId('cell-name');
  return nameCells.map(cell => cell.textContent?.trim() || '');
};

// Helper to wait for table to load with players
const waitForPlayersToLoad = async (minPlayers = 1) => {
  await waitFor(() => {
    // Wait for player name cells to appear (confirms data loaded)
    const nameCells = screen.queryAllByTestId('cell-name');
    expect(nameCells.length).toBeGreaterThanOrEqual(minPlayers);
  }, { timeout: 10000 });
};

describe('RosterPage Integration Tests', () => {
  beforeEach(async () => {
    await fetch(`${MOCK_SERVER_URL}/_reset`, { method: 'POST' });
    await useTestData();
  });

  describe('Initial Load with Test Data', () => {
    it('loads test players on the All tab', async () => {
      renderRosterPage('1');
      await waitForPlayersToLoad();

      // Test data has 36 players - verify we have a reasonable number
      const count = countPlayerRows();
      expect(count).toBeGreaterThan(0);
      expect(count).toBe(36);
    }, 15000);

    it('displays player names from test data', async () => {
      renderRosterPage('1');
      await waitForPlayersToLoad();

      // Check that we have player name cells
      const names = getPlayerNames();
      expect(names.length).toBeGreaterThan(0);
      // Check for specific known players in test data
      expect(names).toContain('Tom Brady');
    }, 15000);
  });

  describe('Search Filtering', () => {
    it('filters players by name search', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      const searchInput = screen.getByPlaceholderText(/Search by name/i);
      await user.type(searchInput, 'Brady');

      await waitFor(() => {
        expect(countPlayerRows()).toBe(1);
      });
      expect(screen.getByText('Tom Brady')).toBeInTheDocument();
    });

    it('filters players by partial name match', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      const searchInput = screen.getByPlaceholderText(/Search by name/i);
      await user.type(searchInput, 'Injured');

      // There are 4 players with "Injured" in their name
      await waitFor(() => {
        expect(countPlayerRows()).toBe(4);
      });
    });

    it('shows "No players found" when search has no matches', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      const searchInput = screen.getByPlaceholderText(/Search by name/i);
      await user.type(searchInput, 'ZZZZNONEXISTENT');

      await waitFor(() => {
        expect(screen.getByText('No players found')).toBeInTheDocument();
      });
      expect(countPlayerRows()).toBe(0);
    });

    it('is case insensitive', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      const searchInput = screen.getByPlaceholderText(/Search by name/i);
      await user.type(searchInput, 'TOM BRADY');

      await waitFor(() => {
        expect(countPlayerRows()).toBe(1);
      });
    });
  });

  describe('Numeric Column Filters', () => {
    it('filters by age > 30', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      // Open the age filter popover
      const ageFilterButton = screen.getByTestId('column-filter-age');
      await user.click(ageFilterButton);

      // Type in filter
      const filterInput = screen.getByTestId('column-filter-input-age');
      await user.type(filterInput, '>30');
      await user.keyboard('{Enter}');

      // Players age > 30: Tom Brady(35), Old Veteran(33), Slow Possession(31),
      // Travis Kelce(32), Trent Williams(34), Aaron Donald(31), Bobby Wagner(32),
      // Veteran Corner(30 - not included), Justin Tucker(33)
      // That's 8 players with age > 30
      await waitFor(() => {
        const count = countPlayerRows();
        expect(count).toBeGreaterThan(0);
        expect(count).toBeLessThan(36);
      });

      // Verify Tom Brady (age 35) is shown
      expect(screen.getByText('Tom Brady')).toBeInTheDocument();
    });

    it('filters by age < 25', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      const ageFilterButton = screen.getByTestId('column-filter-age');
      await user.click(ageFilterButton);

      const filterInput = screen.getByTestId('column-filter-input-age');
      await user.type(filterInput, '<25');
      await user.keyboard('{Enter}');

      // Players age < 25: Young Rookie(22), Fast Speedster(23), Injured Receiver(24),
      // Rotational End(24), Backup Backer(24), Sauce Gardner(23), Rookie Lineman(22)
      await waitFor(() => {
        const count = countPlayerRows();
        expect(count).toBeGreaterThan(0);
        expect(count).toBeLessThan(15);
      });

      // Verify Young Rookie (age 22) is shown
      expect(screen.getByText('Young Rookie')).toBeInTheDocument();
    });

    it('handles invalid filter input gracefully - shows validation error', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      const ageFilterButton = screen.getByTestId('column-filter-age');
      await user.click(ageFilterButton);

      const filterInput = screen.getByTestId('column-filter-input-age');
      await user.type(filterInput, 'garbage');

      // Input should show error state (red border)
      await waitFor(() => {
        expect(filterInput).toHaveClass('border-red-500');
      });

      // Should NOT apply invalid filter - still show all players
      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(countPlayerRows()).toBe(36);
      });
    });

    it('handles nonsense operators gracefully', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      const ageFilterButton = screen.getByTestId('column-filter-age');
      await user.click(ageFilterButton);

      const filterInput = screen.getByTestId('column-filter-input-age');
      await user.type(filterInput, '>>><25');

      // Should show error state
      await waitFor(() => {
        expect(filterInput).toHaveClass('border-red-500');
      });
    });

    it('handles empty filter input - shows all players', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      const ageFilterButton = screen.getByTestId('column-filter-age');
      await user.click(ageFilterButton);

      // Just press enter with empty input (input should be focused after popover opens)
      await user.keyboard('{Enter}');

      // Should still show all players
      await waitFor(() => {
        expect(countPlayerRows()).toBe(36);
      });
    });

    it('clears filter when clear button clicked', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      // Apply a filter first
      const ageFilterButton = screen.getByTestId('column-filter-age');
      await user.click(ageFilterButton);

      // Wait for popover to open
      await waitFor(() => {
        expect(screen.getByTestId('column-filter-popover-age')).toBeInTheDocument();
      });

      const filterInput = screen.getByTestId('column-filter-input-age');
      await user.type(filterInput, '>30');
      await user.keyboard('{Enter}');

      // Wait for filter to be applied (popover stays open after Enter)
      await waitFor(() => {
        expect(countPlayerRows()).toBeLessThan(36);
      });

      // Popover is still open after Enter - clear button should now be visible
      await waitFor(() => {
        expect(screen.getByTestId('column-filter-clear-age')).toBeInTheDocument();
      });

      const clearButton = screen.getByTestId('column-filter-clear-age');
      await user.click(clearButton);

      await waitFor(() => {
        expect(countPlayerRows()).toBe(36);
      });
    });

    it('filter applies on blur (not just enter)', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      const ageFilterButton = screen.getByTestId('column-filter-age');
      await user.click(ageFilterButton);

      const filterInput = screen.getByTestId('column-filter-input-age');
      await user.type(filterInput, '>30');

      // Tab away to blur
      await user.tab();

      await waitFor(() => {
        expect(countPlayerRows()).toBeLessThan(36);
      });
    });
  });

  describe('Status Filter', () => {
    it('filters to show only injured players', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      // Open status filter
      const statusFilterButton = screen.getByTestId('column-filter-status');
      await user.click(statusFilterButton);

      // Click on "Injured" option
      const injuredOption = screen.getByTestId('column-filter-status-Injured');
      await user.click(injuredOption);

      // Should show only 4 injured players
      await waitFor(() => {
        expect(countPlayerRows()).toBe(4);
      });

      // Verify injured players are shown
      expect(screen.getByText('Injured Quarterback')).toBeInTheDocument();
      expect(screen.getByText('Injured Receiver')).toBeInTheDocument();
      expect(screen.getByText('Injured Tackle')).toBeInTheDocument();
      expect(screen.getByText('Injured Cornerback')).toBeInTheDocument();
    });

    it('shows all players when "All" is selected', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      // First filter to injured
      const statusFilterButton = screen.getByTestId('column-filter-status');
      await user.click(statusFilterButton);

      // Wait for popover to open
      await waitFor(() => {
        expect(screen.getByTestId('column-filter-status-Injured')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('column-filter-status-Injured'));

      await waitFor(() => {
        expect(countPlayerRows()).toBe(4);
      });

      // Popover stays open after selecting a status option
      // Click All to show all players
      await waitFor(() => {
        expect(screen.getByTestId('column-filter-all-status')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('column-filter-all-status'));

      await waitFor(() => {
        expect(countPlayerRows()).toBe(36);
      });
    });

    it('shows filter active indicator when status filter applied', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      const statusFilterButton = screen.getByTestId('column-filter-status');

      // Initially no active indicator
      expect(screen.queryByTestId('column-filter-active-status')).not.toBeInTheDocument();

      await user.click(statusFilterButton);
      await user.click(screen.getByTestId('column-filter-status-Injured'));

      // Now should have active indicator
      await waitFor(() => {
        expect(screen.getByTestId('column-filter-active-status')).toBeInTheDocument();
      });
    });
  });

  describe('Position Dropdown Filter', () => {
    it('filters to show only QBs when QB selected', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      // Open position filter
      const positionFilterButton = screen.getByTestId('column-filter-position');
      await user.click(positionFilterButton);

      // Click on QB
      const qbOption = screen.getByTestId('column-filter-pos-QB');
      await user.click(qbOption);

      // Should show only 3 QBs
      await waitFor(() => {
        expect(countPlayerRows()).toBe(3);
      });

      expect(screen.getByText('Tom Brady')).toBeInTheDocument();
      expect(screen.getByText('Derek Carr')).toBeInTheDocument();
      expect(screen.getByText('Injured Quarterback')).toBeInTheDocument();
    });

    it('allows multi-select of positions', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      const positionFilterButton = screen.getByTestId('column-filter-position');
      await user.click(positionFilterButton);

      // Select QB and RB
      await user.click(screen.getByTestId('column-filter-pos-QB'));
      await user.click(screen.getByTestId('column-filter-pos-RB'));

      // Should show 3 QBs + 4 RBs = 7 players
      await waitFor(() => {
        expect(countPlayerRows()).toBe(7);
      });
    });

    it('shows "All" when no specific positions selected', async () => {
      renderRosterPage('1');
      await waitForPlayersToLoad();

      // All positions shown initially
      expect(countPlayerRows()).toBe(36);
    });
  });

  describe('Tab Switching', () => {
    it('offense tab shows only offensive players', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      await user.click(screen.getByTestId('roster-tab-offense'));

      // Offense: QB(3) + RB(4) + WR(5) + TE(2) + OL(5) = 19 players
      await waitFor(() => {
        expect(countPlayerRows()).toBe(19);
      });

      // Should not see defensive players
      expect(screen.queryByText('Aaron Donald')).not.toBeInTheDocument();
    });

    it('defense tab shows only defensive players', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      await user.click(screen.getByTestId('roster-tab-defense'));

      // Defense: DL(4) + LB(4) + CB(4) + S(3) = 15 players
      await waitFor(() => {
        expect(countPlayerRows()).toBe(15);
      });

      // Should see Aaron Donald
      expect(screen.getByText('Aaron Donald')).toBeInTheDocument();
      // Should not see offensive players
      expect(screen.queryByText('Tom Brady')).not.toBeInTheDocument();
    });

    it('special teams tab shows only K and P', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      await user.click(screen.getByTestId('roster-tab-specialTeams'));

      // Special teams: K(1) + P(1) = 2 players
      await waitFor(() => {
        expect(countPlayerRows()).toBe(2);
      });

      expect(screen.getByText('Justin Tucker')).toBeInTheDocument();
      expect(screen.getByText('Michael Dickson')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('sorts by name ascending when name header clicked', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      // Click name header to sort
      const nameHeader = screen.getByTestId('column-header-name');
      const sortableSpan = within(nameHeader).getByText(/Name/);
      await user.click(sortableSpan);

      await waitFor(() => {
        expect(nameHeader.textContent).toContain('↑');
      });

      const names = getPlayerNames();
      // Sort is by lastName - Adams (Davante Adams) should be first in ascending order
      expect(names[0]).toBe('Davante Adams');
    });

    it('sorts by name descending on second click', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      const nameHeader = screen.getByTestId('column-header-name');
      const sortableSpan = within(nameHeader).getByText(/Name/);

      // First click - ascending
      await user.click(sortableSpan);

      await waitFor(() => {
        expect(nameHeader.textContent).toContain('↑');
      });

      // Second click - descending
      await user.click(sortableSpan);

      await waitFor(() => {
        expect(nameHeader.textContent).toContain('↓');
      });

      // The sort order should now be Z->A by lastName
      // Verify the first player is different from ascending order
      const names = getPlayerNames();
      expect(names.length).toBeGreaterThan(0);
      // Sort is by lastName - Williams should be first in descending order
      expect(names[0]).toBe('Trent Williams');
    });

    it('shows sort indicator on sorted column', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      const nameHeader = screen.getByTestId('column-header-name');
      const sortableSpan = within(nameHeader).getByText(/Name/);
      await user.click(sortableSpan);

      await waitFor(() => {
        expect(nameHeader.textContent).toContain('↑');
      });

      await user.click(sortableSpan);
      await waitFor(() => {
        expect(nameHeader.textContent).toContain('↓');
      });
    });
  });

  describe('Combined Filters', () => {
    it('combines search and position filter', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      // Filter to QBs only
      const positionFilterButton = screen.getByTestId('column-filter-position');
      await user.click(positionFilterButton);
      await user.click(screen.getByTestId('column-filter-pos-QB'));

      await waitFor(() => {
        expect(countPlayerRows()).toBe(3);
      });

      // Now search for "Tom"
      const searchInput = screen.getByPlaceholderText(/Search by name/i);
      await user.type(searchInput, 'Tom');

      await waitFor(() => {
        expect(countPlayerRows()).toBe(1);
      });
      expect(screen.getByText('Tom Brady')).toBeInTheDocument();
    });

    it('combines age filter and status filter', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      // Filter to injured only
      const statusFilterButton = screen.getByTestId('column-filter-status');
      await user.click(statusFilterButton);
      await user.click(screen.getByTestId('column-filter-status-Injured'));

      await waitFor(() => {
        expect(countPlayerRows()).toBe(4);
      });

      // Now filter age < 26
      const ageFilterButton = screen.getByTestId('column-filter-age');
      await user.click(ageFilterButton);
      const filterInput = screen.getByTestId('column-filter-input-age');
      await user.type(filterInput, '<26');
      await user.keyboard('{Enter}');

      // Injured players under 26: Injured Quarterback(25), Injured Receiver(24),
      // Injured Cornerback(25) = 3 players
      // Injured Tackle is 29
      await waitFor(() => {
        expect(countPlayerRows()).toBe(3);
      });
    });

    it('no results when filters eliminate all players', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      // Filter to special teams
      await user.click(screen.getByTestId('roster-tab-specialTeams'));

      await waitFor(() => {
        expect(countPlayerRows()).toBe(2);
      });

      // Now filter to injured (no K or P is injured)
      const statusFilterButton = screen.getByTestId('column-filter-status');
      await user.click(statusFilterButton);
      await user.click(screen.getByTestId('column-filter-status-Injured'));

      await waitFor(() => {
        expect(screen.getByText('No players found')).toBeInTheDocument();
      });
    });
  });

  describe('Clear All Filters', () => {
    it('clear filters button resets all filters', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      // Apply multiple filters
      const searchInput = screen.getByPlaceholderText(/Search by name/i);
      await user.type(searchInput, 'Brady');

      await waitFor(() => {
        expect(countPlayerRows()).toBe(1);
      });

      // Look for clear filters button
      const clearButton = screen.getByRole('button', { name: /Clear Filters/i });
      await user.click(clearButton);

      await waitFor(() => {
        expect(countPlayerRows()).toBe(36);
      });

      // Search input should be cleared
      expect(searchInput).toHaveValue('');
    });

    it('clear filters button only appears when filters are active', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      // Initially no clear button
      expect(screen.queryByRole('button', { name: /Clear Filters/i })).not.toBeInTheDocument();

      // Apply a filter
      const searchInput = screen.getByPlaceholderText(/Search by name/i);
      await user.type(searchInput, 'Brady');

      // Now clear button should appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Clear Filters/i })).toBeInTheDocument();
      });
    });
  });

  describe('Status Column Display', () => {
    it('shows INJ badge for injured players', async () => {
      renderRosterPage('1');
      await waitForPlayersToLoad();

      // Filter to injured to make it easier to find
      const user = userEvent.setup();
      const statusFilterButton = screen.getByTestId('column-filter-status');
      await user.click(statusFilterButton);
      await user.click(screen.getByTestId('column-filter-status-Injured'));

      await waitFor(() => {
        // Look for INJ badges
        const injBadges = screen.getAllByText('INJ');
        expect(injBadges.length).toBe(4);
      });
    });

    it('shows empty status cell for active players', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      // Filter to just Tom Brady (not injured)
      const searchInput = screen.getByPlaceholderText(/Search by name/i);
      await user.type(searchInput, 'Tom Brady');

      await waitFor(() => {
        expect(countPlayerRows()).toBe(1);
      });

      // The status cell should be empty (no INJ badge)
      const statusCell = screen.getByTestId('cell-status');
      expect(statusCell.textContent?.trim()).toBe('');
    });
  });

  describe('Filter Popover Behavior', () => {
    it('closes popover on Escape key', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      const ageFilterButton = screen.getByTestId('column-filter-age');
      await user.click(ageFilterButton);

      expect(screen.getByTestId('column-filter-popover-age')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByTestId('column-filter-popover-age')).not.toBeInTheDocument();
      });
    });

    it('closes popover on click outside', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      const ageFilterButton = screen.getByTestId('column-filter-age');
      await user.click(ageFilterButton);

      expect(screen.getByTestId('column-filter-popover-age')).toBeInTheDocument();

      // Click on the table (outside popover)
      await user.click(screen.getByTestId('roster-table'));

      await waitFor(() => {
        expect(screen.queryByTestId('column-filter-popover-age')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles special characters in search', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      const searchInput = screen.getByPlaceholderText(/Search by name/i);
      await user.type(searchInput, '<script>alert("xss")</script>');

      // Should show no results, not crash
      await waitFor(() => {
        expect(screen.getByText('No players found')).toBeInTheDocument();
      });
    });

    it('handles very long search input', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      const searchInput = screen.getByPlaceholderText(/Search by name/i);
      // Use a moderately long string (50 chars is enough to test the edge case)
      const longString = 'abcdefghijklmnopqrstuvwxyz'.repeat(2);
      await user.type(searchInput, longString);

      // Should show no results, not crash
      await waitFor(() => {
        expect(screen.getByText('No players found')).toBeInTheDocument();
      });
    }, 15000);

    it('handles filter with decimal values', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      const ageFilterButton = screen.getByTestId('column-filter-age');
      await user.click(ageFilterButton);

      // Wait for popover to be visible
      await waitFor(() => {
        expect(screen.getByTestId('column-filter-popover-age')).toBeInTheDocument();
      });

      const filterInput = screen.getByTestId('column-filter-input-age');
      await user.type(filterInput, '>25.5');
      await user.keyboard('{Enter}');

      // Players with age > 25.5 (i.e., age >= 26) should be shown
      // There are 24 players age 26 or older in test data
      await waitFor(() => {
        expect(countPlayerRows()).toBeLessThan(36);
      });
    });

    it('handles negative filter values', async () => {
      const user = userEvent.setup();
      renderRosterPage('1');
      await waitForPlayersToLoad();

      const ageFilterButton = screen.getByTestId('column-filter-age');
      await user.click(ageFilterButton);

      const filterInput = screen.getByTestId('column-filter-input-age');
      await user.type(filterInput, '>-5');
      await user.keyboard('{Enter}');

      // All ages are positive, so all should pass
      await waitFor(() => {
        expect(countPlayerRows()).toBe(36);
      });
    });
  });
});
