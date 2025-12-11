import { defineConfig, devices } from '@playwright/test'

/**
 * Local E2E test configuration.
 *
 * This config is for running E2E tests locally with mock API server.
 * It starts both the mock server and dev server fresh.
 *
 * Usage:
 *   npm run test:e2e:local
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  workers: undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'npm run mock-server',
      url: 'http://localhost:3001/api/leagues-management/constraints',
      reuseExistingServer: false,
      timeout: 60000,
    },
    {
      command: 'npm run dev:mock',
      url: 'http://localhost:3000',
      reuseExistingServer: false,
      timeout: 60000,
    },
  ],
})
