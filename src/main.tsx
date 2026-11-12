import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'

// Instala el service worker (src/sw.ts) y lo actualiza solo cuando hay versión nueva.
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
