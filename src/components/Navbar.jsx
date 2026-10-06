import { useEffect, useState } from 'react'
import { nav, contactHref } from '../data.js'
import { contactClick } from '../lib/contact.js'
import Logo from './Logo.jsx'
import { openCenter, unreadOf, useBroadcasts } from '../lib/broadcast.js'

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark')
  const toggle = () => {
    const next = dark ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('sk-theme', next) } catch (e) {}
    setDark(!dark)
  }
  return (
    <button onClick={toggle} aria-label={dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'} className="glass grid h-11 w-11 place-items-center rounded-full text-ink">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
        {dark ? (<><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" /></>) : (<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />)}
      </svg>
    </button>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const nb = useBroadcasts(), unread = unreadOf(nb).length
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  const bar = 'absolute left-0 block h-[2px] w-5 bg-ink transition duration-200'
  return (
    <header className="fixed inset-x-0 top-3 z-40 px-3 sm:px-5">
      <div className="glass mx-auto max-w-6xl rounded-[28px]">
        <div className="flex h-[68px] items-center justify-between px-3 sm:px-4">
          <a href="#beranda" className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
            <Logo className="h-10 w-10" /><span>Sagara <span className="grad-text">Karya</span></span>
          </a>
          <nav aria-label="Navigasi utama" className="hidden items-center gap-6 lg:flex">
            {nav.map(([l, h]) => <a key={h} href={h} className="text-[15px] font-medium text-muted transition-colors hover:text-ink">{l}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            {nb.items.length > 0 && (
              <button onClick={openCenter} aria-label={`Notifikasi, ${unread} belum dibaca`} className="glass grid h-11 w-11 place-items-center rounded-full text-ink">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9a6 6 0 1 1 12 0c0 6 2 7.5 2 7.5H4S6 15 6 9zM10 20a2 2 0 0 0 4 0" /></svg>
                {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-onaccent">{unread}</span>}
              </button>
            )}
            <ThemeToggle />
            <a href={contactHref} onClick={contactClick} className="btn btn-primary hidden !min-h-[44px] lg:inline-flex">Mulai Konsultasi</a>
            <button onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="menu-mobile" aria-label={open ? 'Tutup menu' : 'Buka menu'} className="glass grid h-11 w-11 place-items-center rounded-full lg:hidden">
              <span className="relative block h-5 w-5">
                <span className={`${bar} top-[4px] ${open ? 'translate-y-[5px] rotate-45' : ''}`} />
                <span className={`${bar} top-[9px] ${open ? 'opacity-0' : ''}`} />
                <span className={`${bar} top-[14px] ${open ? '-translate-y-[5px] -rotate-45' : ''}`} />
              </span>
            </button>
          </div>
        </div>
        <div id="menu-mobile" hidden={!open} className="border-t border-line px-4 pb-4 lg:hidden">
          <nav aria-label="Navigasi seluler" className="flex flex-col py-2">
            {nav.map(([l, h]) => <a key={h} href={h} onClick={() => setOpen(false)} className="border-b border-line py-4 text-lg font-semibold last:border-0">{l}</a>)}
          </nav>
          <a href={contactHref} onClick={(e) => { setOpen(false); contactClick(e) }} className="btn btn-primary w-full">Mulai Konsultasi</a>
        </div>
      </div>
    </header>
  )
}
