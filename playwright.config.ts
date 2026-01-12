import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  // Run serially - tests share mock server state and can't run in parallel
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
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
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev:mock',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    },
  ],
})
