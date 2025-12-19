import './index.css'
import App from './App.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastProvider } from './utils/toast.tsx';
import { config } from './config/env.config.js';
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = `${config.googleClientId}`;
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);