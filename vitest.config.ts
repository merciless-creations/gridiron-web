import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    globalSetup: './src/test/globalSetup.ts',
    setupFiles: './src/test/setup.ts',
    css: true,
    exclude: ['**/node_modules/**', '**/e2e/**'],
    env: {
      VITE_API_URL: 'http://localhost:3002/api',
      VITE_MOCK_AUTH: 'true',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
        'src/main.tsx',
      ],
      thresholds: {
        statements: 50,
        branches: 50,
        functions: 50,
        lines: 50,
      },
    },
  },
})
