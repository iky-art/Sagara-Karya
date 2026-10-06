import { useEffect, useState } from 'react'
import Logo from './Logo.jsx'
import { getPrefs } from '../lib/prefs.js'
const seen = () => { try { return sessionStorage.getItem('sk-splash') } catch (e) { return null } }
export default function Splash() {
  const [show, setShow] = useState(() => !seen() && getPrefs().splash && getPrefs().motion && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [out, setOut] = useState(false)
  useEffect(() => {
    if (!show) return
    try { sessionStorage.setItem('sk-splash', '1') } catch (e) {}
    document.body.style.overflow = 'hidden'
    const a = setTimeout(() => setOut(true), 3200)
    return () => { clearTimeout(a); document.body.style.overflow = '' }
  }, [show])
  useEffect(() => {
    if (!out) return
    const b = setTimeout(() => setShow(false), 650)
    return () => clearTimeout(b)
  }, [out])
  if (!show) return null
  return (
    <div aria-hidden="true" onClick={() => setOut(true)} className={`splash fixed inset-0 z-[100] grid place-items-center px-6 ${out ? 'splash-out' : ''}`}>
      <div className="flex flex-col items-center text-center">
        <span className="splash-logo glass grid h-28 w-28 place-items-center rounded-[34px]"><Logo className="h-16 w-16" /></span>
        <p className="splash-word mt-6 text-3xl font-extrabold tracking-tight">Sagara <span className="grad-text">Karya</span></p>
        <p className="splash-sub mt-2 max-w-xs text-sm text-muted">Studio digital untuk website dan identitas digital.</p>
        <span className="splash-bar mt-8 block h-1 w-32 overflow-hidden rounded-full bg-ink/10"><span className="splash-fill block h-full rounded-full bg-ink/70" /></span>
      </div>
    </div>
  )
}
