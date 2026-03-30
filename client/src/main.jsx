import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Polyfills for simple-peer
window.global = window;
window.process = { env: {} };

import App from './App.jsx'
import './i18n'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
