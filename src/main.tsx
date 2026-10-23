import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
// self-hosted fonts: bundled and precached so the demo survives with no venue Wi-Fi
import '@fontsource/ibm-plex-sans-arabic/arabic-400.css'
import '@fontsource/ibm-plex-sans-arabic/arabic-500.css'
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css'
import '@fontsource/ibm-plex-sans-arabic/latin-400.css'
import '@fontsource/ibm-plex-sans-arabic/latin-500.css'
import '@fontsource/noto-kufi-arabic/arabic-400.css'
import '@fontsource/noto-kufi-arabic/arabic-600.css'
import '@fontsource/noto-kufi-arabic/arabic-700.css'
import '@fontsource/noto-kufi-arabic/latin-600.css'
import '@fontsource/noto-kufi-arabic/latin-700.css'
import '@fontsource/ibm-plex-sans/latin-400.css'
import '@fontsource/ibm-plex-sans/latin-500.css'
import '@fontsource/ibm-plex-sans/latin-600.css'
import App from './App'
import './styles/tokens.css'

// Inside the #/demo phone frame: leave room for the notch and forward demo shortcuts to the parent page.
if (window.self !== window.top) {
  document.documentElement.dataset.embed = 'true'
  window.addEventListener('keydown', (e) => {
    const el = e.target as HTMLElement | null
    if (el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return
    if (e.ctrlKey || e.metaKey || e.altKey) return
    window.parent.postMessage({ type: 'nabdh-key', key: e.key }, window.location.origin)
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
