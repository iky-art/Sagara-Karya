import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Legal from './pages/Legal.jsx'
import { ADMIN_UUID } from './lib/supabase.js'
import { isStandalone } from './lib/pwa.js'
import './lib/prefs.js'
import './index.css'
const Admin = lazy(() => import('./admin/Admin.jsx'))
const AppShell = lazy(() => import('./app/AppShell.jsx'))
const path = location.pathname.replace(/\/+$/, '')
const web = new URLSearchParams(location.search).has('web')
const isAdmin = ADMIN_UUID && path === `/${ADMIN_UUID}/admin`
const legal = { '/syarat-ketentuan': 'syarat', '/kebijakan-privasi': 'privasi' }[path]
const isApp = path === '/app' || (path === '' && !web && isStandalone())
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? <Suspense fallback={null}><Admin /></Suspense>
      : legal ? <Legal slug={legal} />
      : isApp ? <Suspense fallback={null}><AppShell /></Suspense>
      : <App />}
  </StrictMode>
)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}
