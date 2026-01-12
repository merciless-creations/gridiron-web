import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { MockAuthProvider } from '../auth'
import { ActiveContextProvider } from '../contexts/ActiveContextProvider'
import { PreferencesProvider } from '../contexts/preferences'

// Create a new QueryClient for each test with retry disabled
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

interface WrapperProps {
  children: ReactNode
  initialEntries?: string[]
}

// Wrapper component that provides all necessary providers
const AllTheProviders = ({ children, initialEntries = ['/'] }: WrapperProps) => {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <MockAuthProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <ActiveContextProvider>
            <PreferencesProvider>
              {children}
            </PreferencesProvider>
          </ActiveContextProvider>
        </MemoryRouter>
      </MockAuthProvider>
    </QueryClientProvider>
  )
}

// Custom render function that wraps with all providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
}

export const renderWithProviders = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const { initialEntries, ...renderOptions } = options || {}

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders initialEntries={initialEntries}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { renderWithProviders as render }
