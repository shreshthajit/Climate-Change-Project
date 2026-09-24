import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './lib/store.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// recharts calls Object.hasOwn, which Chrome < 93 and Safari < 15.4 lack.
if (!Object.hasOwn) {
  Object.hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)
}

// Links shared without the hash (e.g. /explore) are served index.html by the Vercel rewrite;
// move the path into the hash so HashRouter opens the right page.
const { pathname, search, hash } = window.location
if (pathname !== '/' && pathname !== '/index.html' && !hash) {
  window.history.replaceState(null, '', `/#${pathname}${search}`)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </HashRouter>
    </ErrorBoundary>
  </StrictMode>,
)
