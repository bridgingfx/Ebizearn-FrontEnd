import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { RegionProvider } from './context/RegionContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <RegionProvider>
        <App />
      </RegionProvider>
    </ThemeProvider>
  </StrictMode>,
)
