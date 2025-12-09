import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'
import './index.css'
import App from './App.tsx'
import { msalConfig } from './config/authConfig'
import { setupAuthInterceptor } from './api/client'

const msalInstance = new PublicClientApplication(msalConfig)

// Setup auth interceptor for API calls
setupAuthInterceptor(msalInstance)

// Function to render the app
const renderApp = () => {
  msalInstance.initialize().then(() => {
    msalInstance.handleRedirectPromise().catch((error) => {
      // Log auth errors but don't block rendering
      console.error('Error handling redirect:', error)
    }).finally(() => {
      // Render app regardless of auth state
      createRoot(document.getElementById('root')!).render(
        <StrictMode>
          <MsalProvider instance={msalInstance}>
            <App />
          </MsalProvider>
        </StrictMode>,
      )
    })
  })
}

// Start MSW in E2E test mode, otherwise render immediately
async function prepare() {
  if (import.meta.env.VITE_E2E_TEST_MODE === 'true') {
    const { worker } = await import('./test/mocks/browser')
    await worker.start({
      onUnhandledRequest: 'bypass', // Let unhandled requests pass through
    })
  }
}

prepare().then(renderApp)
