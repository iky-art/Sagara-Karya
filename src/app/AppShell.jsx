import { useEffect, useState } from 'react'
import Logo from '../components/Logo.jsx'
import Splash from '../components/Splash.jsx'
import NotificationLayer from '../components/NotificationLayer.jsx'
import ContactChooser from '../components/ContactChooser.jsx'
import { openCenter, unreadOf, useBroadcasts } from '../lib/broadcast.js'
import { buzz, usePrefs } from '../lib/prefs.js'
import { enterFull, setWake } from '../lib/device.js'
import { isStandalone } from '../lib/pwa.js'
import { Cara, Faq, Home, I, Ico, InfoApp, Lacak, Langganan, Paket, Profil, Voucher, VoucherKu } from './screens.jsx'
import * as S from './settings.jsx'
import Toaster from '../components/Toaster.jsx'
const TABS = [['home', 'Beranda', I.home], ['paket', 'Paket', I.box], ['voucher', 'Voucher', I.ticket], ['setelan', 'Setelan', I.sliders]]
const TITLE = { home: 'Sagara Karya', paket: 'Paket', voucher: 'Voucher', setelan: 'Setelan' }
const SUBS = { lacak: 'Lacak Pesanan', profil: 'Profil Saya', voucherku: 'Voucher Saya', faq: 'Pertanyaan Umum', cara: 'Cara Kerja', info: 'Info Aplikasi', langganan: 'Kabar Email', 'set-akun': 'Akun & Pesanan', 'set-notif': 'Notifikasi', 'set-tampilan': 'Tampilan', 'set-layar': 'Layar & Perangkat', 'set-data': 'Privasi & Data', 'set-bantuan': 'Bantuan', 'set-tentang': 'Tentang', tips: 'Tips Penggunaan', rilis: 'Catatan Rilis', kredit: 'Kredit' }
export default function AppShell() {
  const q = new URLSearchParams(location.search)
  const pr = usePrefs()
  const [tab, setTab] = useState(TABS.some((t) => t[0] === q.get('tab')) ? q.get('tab') : pr.start)
  const [sub, setSub] = useState(q.get('lacak') ? 'lacak' : null)
  const [online, setOnline] = useState(navigator.onLine)
  const nb = useBroadcasts(), unread = unreadOf(nb).length
  useEffect(() => {
    const pop = () => setSub(null), on = () => setOnline(true), off = () => setOnline(false)
    window.addEventListener('popstate', pop); window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { window.removeEventListener('popstate', pop); window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  useEffect(() => { window.scrollTo(0, 0) }, [tab, sub])
  useEffect(() => { setWake(pr.wake) }, [pr.wake])
  useEffect(() => {
    if (!pr.fullscreen || !isStandalone()) return
    const go = () => { if (!document.fullscreenElement) enterFull() }
    window.addEventListener('pointerup', go, { once: true })
    return () => window.removeEventListener('pointerup', go)
  }, [pr.fullscreen])
  const openSub = (k) => { buzz(); history.pushState({ sub: 1 }, ''); setSub(k) }
  const back = () => (history.state?.sub ? history.back() : setSub(null))
  const go = (k) => { buzz(); setSub(null); setTab(k) }
  const shown = sub ? SUBS[sub] : TITLE[tab]
  const subView = { lacak: <Lacak />, profil: <Profil />, voucherku: <VoucherKu />, faq: <Faq />, cara: <Cara />, info: <InfoApp />, langganan: <Langganan />, 'set-akun': <S.SetAkun openSub={openSub} />, 'set-notif': <S.SetNotif />, 'set-tampilan': <S.SetTampilan />, 'set-layar': <S.SetLayar />, 'set-data': <S.SetData />, 'set-bantuan': <S.SetBantuan openSub={openSub} />, 'set-tentang': <S.SetTentang openSub={openSub} />, tips: <S.Tips />, rilis: <S.Rilis />, kredit: <S.Kredit /> }[sub]
  return (
    <>
      <Splash />
      <header className="fixed inset-x-0 top-0 z-40 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="glass mx-auto flex h-14 max-w-lg items-center justify-between rounded-full pl-2 pr-2">
          <div className="flex items-center gap-2 font-bold">
            {sub ? (
              <button type="button" onClick={back} aria-label="Kembali" className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand"><Ico d={I.back} /></button>
            ) : <Logo className="ml-1 h-9 w-9" />}
            <h1 className="text-lg">{shown}</h1>
          </div>
          <button type="button" onClick={openCenter} aria-label={`Notifikasi, ${unread} belum dibaca`} className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-sand">
            <Ico d={I.bell} />
            {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-onaccent">{unread}</span>}
          </button>
        </div>
      </header>
      {!online && <p role="status" className="solid fixed left-1/2 top-[calc(env(safe-area-inset-top)+4.9rem)] z-30 -translate-x-1/2 rounded-full px-4 py-1.5 text-sm font-medium">Kamu sedang offline</p>}
      <main className="mx-auto max-w-lg px-4 pb-36 pt-[calc(env(safe-area-inset-top)+5.5rem)]">
        {sub ? subView : tab === 'home' ? <Home go={go} openSub={openSub} /> : tab === 'paket' ? <Paket /> : tab === 'voucher' ? <Voucher /> : <S.Setelan openSub={openSub} />}
      </main>
      <nav aria-label="Menu aplikasi" className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="glass mx-auto flex max-w-sm gap-1 rounded-full p-1.5">
          {TABS.map(([k, l, d]) => {
            const on = tab === k && !sub
            return (
              <button key={k} type="button" onClick={() => go(k)} aria-current={on ? 'page' : undefined} className={`flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[11px] font-semibold transition-colors ${on ? 'bg-ink/10 text-ink' : 'text-muted'}`}>
                <Ico d={d} />{l}
              </button>
            )
          })}
        </div>
      </nav>
      <NotificationLayer />
      <ContactChooser />
      <Toaster />
    </>
  )
}
