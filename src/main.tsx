
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import RemoveBadge from './components/RemoveBadge.tsx';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RemoveBadge />
    <App />
  </React.StrictMode>
);
