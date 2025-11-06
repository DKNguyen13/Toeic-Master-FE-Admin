import './index.css'
import App from './App.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastProvider } from './utils/toast.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = '910454866559-b3h3jc7ggbdrmnllipugaabf4vgtfeq8.apps.googleusercontent.com';
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);