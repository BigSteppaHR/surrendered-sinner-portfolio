
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './components/ThemeProvider';
import { StripeProvider } from './components/StripeProvider';
import { initializeAssetProtection } from './utils/assetLoadingHandler';

// Initialize asset protection
initializeAssetProtection();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <Router>
        <AuthProvider>
          <StripeProvider>
            <App />
          </StripeProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  </React.StrictMode>,
);
