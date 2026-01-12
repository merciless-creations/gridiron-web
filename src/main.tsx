import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { MsalAuthProvider, MockAuthProvider } from './auth';

// Choose auth provider based on environment
const isMockAuth = import.meta.env.VITE_MOCK_AUTH === 'true';
const AuthProvider = isMockAuth ? MockAuthProvider : MsalAuthProvider;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
