import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

const MOCK_SERVER_URL = 'http://localhost:3002'

// Reset mock server state before each test to ensure clean state
beforeEach(async () => {
  try {
    const response = await fetch(`${MOCK_SERVER_URL}/_reset`, { method: 'POST' })
    await response.json() // Ensure response is fully consumed
  } catch {
    // Server might not be running during some tests
  }
})

// Cleanup after each test
afterEach(async () => {
  cleanup()
})
