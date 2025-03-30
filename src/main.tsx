
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './hooks/useAuth';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { StripeProvider } from './components/StripeProvider';
import { initializeAssetProtection } from './utils/assetLoadingHandler';

// Initialize asset protection
initializeAssetProtection();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DarkModeProvider>
      <AuthProvider>
        <StripeProvider>
          <Router>
            <Routes>
              <Route path="/*" element={<App />} />
            </Routes>
          </Router>
        </StripeProvider>
      </AuthProvider>
    </DarkModeProvider>
  </React.StrictMode>,
);
