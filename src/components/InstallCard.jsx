import { useEffect, useRef, useState } from 'react'
import Logo from './Logo.jsx'
import { install, useInstall } from '../lib/pwa.js'
const KEY = 'sk-install-dismissed'
const dismissed = () => { try { return Date.now() - Number(localStorage.getItem(KEY) || 0) < 7 * 864e5 } catch (e) { return false } }
const perks = ['Dibuka dari layar utama, tanpa bar browser', 'Lacak pesanan dan simpan voucher di satu tempat', 'Tampilan khusus aplikasi yang lebih ringkas']
const Check = () => <svg className="mt-0.5 shrink-0 text-accent" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" /></svg>
export default function InstallCard() {
  const ins = useInstall()
  const ref = useRef(null)
  const [ready, setReady] = useState(false)
  const [off, setOff] = useState(dismissed)
  useEffect(() => { const t = setTimeout(() => setReady(true), 4500); return () => clearTimeout(t) }, [])
  const eligible = ready && !off && !ins.standalone && (ins.can || ins.ios)
  useEffect(() => { const d = ref.current; if (d && eligible && !d.open) d.showModal() }, [eligible])
  if (off) return null
  const close = () => { try { localStorage.setItem(KEY, String(Date.now())) } catch (e) {} setOff(true) }
  const go = async () => { await install(); ref.current.close() }
  return (
    <dialog ref={ref} onClose={close} aria-labelledby="inst-h" className="m-auto w-[calc(100%-1.5rem)] max-w-md rounded-[32px] p-0 text-ink backdrop:bg-black/50">
      <div className="p-7 text-center">
        <span className="glass mx-auto grid h-24 w-24 place-items-center rounded-[30px]"><Logo className="h-14 w-14" /></span>
        <h2 id="inst-h" className="mt-6 text-3xl font-extrabold leading-tight tracking-tight">Pasang Sagara Karya di layar utamamu</h2>
        <ul className="mt-5 space-y-3 text-left text-muted">
          {perks.map((p) => <li key={p} className="flex gap-3"><Check />{p}</li>)}
        </ul>
        {ins.can ? (
          <button type="button" onClick={go} className="btn btn-primary mt-7 w-full">Pasang sekarang</button>
        ) : (
          <ol className="mt-6 space-y-2 rounded-2xl bg-sand p-4 text-left text-sm font-medium">
            <li>1. Ketuk tombol Bagikan di Safari</li>
            <li>2. Pilih Tambah ke Layar Utama</li>
          </ol>
        )}
        <button type="button" onClick={() => ref.current.close()} className="btn btn-ghost mt-3 w-full">{ins.can ? 'Nanti saja' : 'Mengerti'}</button>
      </div>
    </dialog>
  )
}
