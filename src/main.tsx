
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupSupabase } from './integrations/supabase/initialize.ts'
import { HelmetProvider } from 'react-helmet-async'

// Add logging to help with debugging
console.log('Initializing application...');

// Ensure Supabase is initialized before rendering the app
const supabaseInitialized = setupSupabase();
console.log('Supabase initialization complete:', supabaseInitialized);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
)
