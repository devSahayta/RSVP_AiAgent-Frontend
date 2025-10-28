import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <KindeProvider
      clientId={import.meta.env.VITE_KINDE_CLIENT_ID}
      domain={import.meta.env.VITE_KINDE_DOMAIN}
      redirectUri="http://localhost:5173/createEvent" // After login
      logoutUri="http://localhost:5173/"                // After logout
    >
      <App />
    </KindeProvider>
  </StrictMode>
);
