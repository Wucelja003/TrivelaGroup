import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Jezik mora biti spreman PRE prvog rendera, inace bi prvi kadar bio bez prevoda.
import './i18n'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
