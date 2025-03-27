
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupSupabase } from './integrations/supabase/initialize.ts'
import { HelmetProvider } from 'react-helmet-async'

// Global error handler for uncaught exceptions
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

// Add logging to help with debugging
console.log('Initializing application...');

// Basic Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000', color: '#ffffff', padding: '20px', textAlign: 'center'}}>
          <h1 style={{color: '#ea384c', marginBottom: '20px'}}>Something went wrong</h1>
          <p>We encountered an error while rendering the application. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()} style={{marginTop: '20px', backgroundColor: '#ea384c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer'}}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

try {
  // Ensure Supabase is initialized before rendering the app
  const supabaseInitialized = setupSupabase();
  console.log('Supabase initialization complete:', supabaseInitialized);

  // Create root element
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found!');
  }
  
  const root = ReactDOM.createRoot(rootElement);
  
  // Wrap app with error boundary
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  );
} catch (error) {
  console.error('Fatal error during application initialization:', error);
  
  // Display fallback UI for critical errors
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #000000; color: #ffffff; padding: 20px; text-align: center;">
        <h1 style="color: #ea384c; margin-bottom: 20px;">Application Error</h1>
        <p>We encountered an error while loading the application. Please try refreshing the page.</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; background-color: #ea384c; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    `;
  }
}
