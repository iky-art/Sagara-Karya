import { useEffect, useRef, useState } from 'react'
import { claim, useClaimed, voucherLabel } from '../lib/vouchers.js'
const day = (t) => new Date(t).toLocaleDateString('id-ID', { dateStyle: 'long' })
export default function VoucherModal({ v, onClose }) {
  const ref = useRef(null)
  const got = useClaimed().includes(v.code)
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    const d = ref.current
    if (!d.open) d.showModal()
    d.addEventListener('close', onClose)
    return () => d.removeEventListener('close', onClose)
  }, [])
  const copy = async () => { try { await navigator.clipboard.writeText(v.code); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch (e) {} }
  const rows = [
    ['Berlaku untuk', v.packages?.length ? v.packages.join(', ') : 'Semua paket'],
    ['Masa berlaku', v.ends_at ? `sampai ${day(v.ends_at)}` : 'Tanpa batas waktu'],
    ...(v.quota ? [['Sisa kuota', `${v.quota - v.used} dari ${v.quota}`]] : []),
  ]
  return (
    <dialog ref={ref} onClick={(e) => e.target === ref.current && ref.current.close()} aria-labelledby="voucher-h" className="m-auto w-[calc(100%-1.5rem)] max-w-md rounded-[28px] p-0 text-ink backdrop:bg-black/50">
      <div className="max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="text-5xl font-extrabold tracking-tight">{voucherLabel(v)}</p>
          <button type="button" onClick={() => ref.current.close()} aria-label="Tutup" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-sand">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <h2 id="voucher-h" className="mt-3 text-2xl font-bold">{v.title}</h2>
        {v.description && <p className="mt-2 whitespace-pre-line text-muted">{v.description}</p>}
        <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
          {rows.map(([k, x]) => <div key={k} className="flex justify-between gap-4"><dt className="text-muted">{k}</dt><dd className="text-right font-medium">{x}</dd></div>)}
        </dl>
        {got ? (
          <div className="mt-6 space-y-3">
            <p className="select-all rounded-2xl bg-sand px-4 py-4 text-center text-2xl font-extrabold tracking-widest text-accent">{v.code}</p>
            <button type="button" onClick={copy} className="btn btn-ghost w-full">{copied ? 'Tersalin' : 'Salin kode'}</button>
            <p className="text-sm text-muted">Voucher tersimpan di perangkat ini. Tukarkan saat memesan, di bagian Tukar voucher.</p>
            <a href="#paket" onClick={() => ref.current.close()} className="btn btn-primary w-full">Pilih Paket</a>
          </div>
        ) : (
          <button type="button" onClick={() => claim(v.code)} className="btn btn-primary mt-6 w-full">Ambil Voucher</button>
        )}
      </div>
    </dialog>
  )
}
