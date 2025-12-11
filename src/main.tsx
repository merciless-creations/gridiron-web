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

// Initialize MSAL and render the app
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
