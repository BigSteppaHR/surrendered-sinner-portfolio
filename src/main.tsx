
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import './styles/animations.css' // Import our custom animations
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from '@/components/AuthProvider'
import StripeProvider from '@/components/StripeProvider'

// Import Tailwind base styles
import 'tailwindcss/tailwind.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <StripeProvider>
            <App />
          </StripeProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)
