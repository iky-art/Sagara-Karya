import { useEffect, useRef } from 'react'
import Logo from './Logo.jsx'
import { closeCenter, openCenter, startBroadcasts, unreadOf, useBroadcasts } from '../lib/broadcast.js'
const ago = (t) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(t)) / 60000))
  if (m < 1) return 'sekarang'
  if (m < 60) return `${m} mnt lalu`
  const h = Math.round(m / 60)
  return h < 24 ? `${h} jam lalu` : `${Math.round(h / 24)} hari lalu`
}
function Row({ n, dim }) {
  return (
    <li className={`flex gap-3 rounded-2xl border border-line bg-bg p-3 ${dim ? 'opacity-70' : ''}`}>
      <Logo className="h-10 w-10" />
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-2"><p className="font-semibold leading-snug">{n.title}</p><span className="shrink-0 text-xs text-muted">{ago(n.created_at)}</span></div>
        <p className="mt-0.5 whitespace-pre-line text-sm text-muted">{n.body}</p>
      </div>
    </li>
  )
}
export default function NotificationLayer() {
  const s = useBroadcasts()
  const ref = useRef(null)
  useEffect(() => { startBroadcasts() }, [])
  useEffect(() => {
    const d = ref.current
    if (s.sheet && !d.open) d.showModal()
    if (!s.sheet && d.open) d.close()
  }, [s.sheet])
  const b = s.banner, more = unreadOf(s).length - 1
  const u = s.sheet?.unread || [], e = s.sheet?.earlier || []
  return (
    <>
      {b && (
        <div role="status" className="notif fixed left-3 right-3 top-[calc(env(safe-area-inset-top,0px)+80px)] z-50 mx-auto max-w-md sm:left-auto sm:right-5 sm:mx-0 sm:w-96">
          <button onClick={openCenter} className="glass solid flex w-full items-start gap-3 rounded-[26px] p-3.5 text-left">
            <Logo className="h-10 w-10" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2 text-xs text-muted"><span>Sagara Karya</span><span>{ago(b.created_at)}</span></span>
              <span className="mt-0.5 block font-semibold leading-snug">{b.title}</span>
              <span className="mt-0.5 line-clamp-2 text-sm text-muted">{b.body}</span>
              {more > 0 && <span className="mt-1.5 block text-xs font-medium text-accent">dan {more} notifikasi lainnya</span>}
            </span>
          </button>
        </div>
      )}
      <dialog ref={ref} onClose={closeCenter} onClick={(ev) => ev.target === ref.current && ref.current.close()} aria-labelledby="notif-h" className="solid m-auto w-[calc(100%-1.5rem)] max-w-md rounded-[28px] p-0 text-ink backdrop:bg-black/40">
        <div className="max-h-[85vh] overflow-y-auto p-5">
          <div className="flex items-center justify-between">
            <h2 id="notif-h" className="text-2xl font-bold">Notifikasi</h2>
            <button type="button" onClick={() => ref.current.close()} aria-label="Tutup" className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          {u.length > 0 ? (
            <><p className="mt-4 text-sm font-semibold">Belum dibaca ({u.length})</p><ul className="mt-2 space-y-2">{u.map((n) => <Row key={n.id} n={n} />)}</ul></>
          ) : <p className="mt-4 text-muted">Tidak ada notifikasi baru.</p>}
          {e.length > 0 && <><p className="mt-6 text-sm font-semibold text-muted">Sebelumnya</p><ul className="mt-2 space-y-2">{e.map((n) => <Row key={n.id} n={n} dim />)}</ul></>}
        </div>
      </dialog>
    </>
  )
}
