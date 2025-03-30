
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/animations.css' // Import our custom animations
import { HelmetProvider } from 'react-helmet-async'
import { initializeAssetProtection } from './utils/assetLoadingHandler'

// Import Tailwind base styles
import 'tailwindcss/tailwind.css'

// Initialize asset protection
initializeAssetProtection();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
)
