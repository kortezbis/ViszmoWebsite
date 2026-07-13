import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'

import { ProfileProvider } from './contexts/ProfileContext'
import { AuthProvider } from './lib/auth'

import { AuthModalProvider } from './contexts/AuthModalContext'
import { PreviewModeProvider } from './contexts/PreviewModeContext'

// Ensure root element exists
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

// Set background immediately
document.body.style.backgroundColor = '#ffffff'
document.body.style.margin = '0'
document.body.style.padding = '0'

createRoot(rootElement).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <ProfileProvider>
          <AuthModalProvider>
            <PreviewModeProvider>
              <App />
            </PreviewModeProvider>
          </AuthModalProvider>
        </ProfileProvider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>,
)
