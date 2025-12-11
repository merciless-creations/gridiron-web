/**
 * Global setup for vitest - starts mock API server
 */
import { spawn, type ChildProcess } from 'child_process'
import path from 'path'

let mockServerProcess: ChildProcess | null = null

// Wait for server to be ready
async function waitForServer(url: string, timeout = 30000): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error(`Server at ${url} did not start within ${timeout}ms`)
}

export async function setup() {
  const serverPath = path.resolve(__dirname, '../../mock-server/server.js')

  console.log('Starting mock API server...')

  mockServerProcess = spawn('node', [serverPath], {
    env: { ...process.env, PORT: '3002' },
    stdio: 'pipe',
  })

  mockServerProcess.stdout?.on('data', (data) => {
    console.log(`[mock-server] ${data}`)
  })

  mockServerProcess.stderr?.on('data', (data) => {
    console.error(`[mock-server] ${data}`)
  })

  // Wait for server to be ready
  await waitForServer('http://localhost:3002/api/leagues-management/constraints')
  console.log('Mock API server ready at http://localhost:3002')
}

export async function teardown() {
  if (mockServerProcess) {
    console.log('Stopping mock API server...')
    mockServerProcess.kill()
    mockServerProcess = null
  }
}
