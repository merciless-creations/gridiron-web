import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll } from 'vitest'
import { server } from './mocks/server'
import { resetLeagueState } from '../mocks/handlers/leagues'

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

// Reset handlers and state after each test
afterEach(() => {
  server.resetHandlers()
  resetLeagueState()
  cleanup()
})

// Close MSW server after all tests
afterAll(() => server.close())
