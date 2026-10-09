import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { RegionProvider } from './context/RegionContext.tsx'
import { UpdateAvailableBar } from './components/common/UpdateAvailableBar.tsx'
import { startAppUpdateWatcher } from './utils/appUpdate.ts'

startAppUpdateWatcher()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <RegionProvider>
        <App />
        <UpdateAvailableBar />
      </RegionProvider>
    </ThemeProvider>
  </StrictMode>,
)
