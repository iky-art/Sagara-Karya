import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'
const inp = 'w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base text-ink focus:border-accent'
const day = (t) => new Date(t).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
export default function Subscribers() {
  const [rows, setRows] = useState([]), [q, setQ] = useState(''), [msg, setMsg] = useState(''), [note, setNote] = useState('')
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false })
    if (error) setMsg('Gagal memuat: ' + error.message); else { setRows(data); setMsg('') }
  }, [])
  useEffect(() => { load() }, [load])
  const active = rows.filter((r) => !r.unsubscribed_at)
  const list = useMemo(() => rows.filter((r) => r.email.includes(q.trim().toLowerCase())), [rows, q])
  const flash = (t) => { setNote(t); setTimeout(() => setNote(''), 2400) }
  const toggle = async (r) => {
    const { error } = await supabase.from('subscribers').update({ unsubscribed_at: r.unsubscribed_at ? null : new Date().toISOString() }).eq('id', r.id)
    error ? setMsg(error.message) : load()
  }
  const remove = async (r) => {
    if (!confirm(`Hapus ${r.email}?`)) return
    const { error } = await supabase.from('subscribers').delete().eq('id', r.id)
    error ? setMsg(error.message) : load()
  }
  const copy = async () => {
    try { await navigator.clipboard.writeText(active.map((r) => r.email).join(', ')); flash(`${active.length} email aktif disalin`) } catch (e) { flash('Gagal menyalin') }
  }
  const csv = () => {
    const esc = (v) => { let s = String(v ?? ''); if (/^[=+\-@]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"` }
    const t = ['email,status,terdaftar', ...list.map((r) => [r.email, r.unsubscribed_at ? 'berhenti' : r.confirmed ? 'terverifikasi' : 'belum diverifikasi', r.created_at].map(esc).join(','))].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t], { type: 'text/csv' })); a.download = 'pelanggan-sagara-karya.csv'; a.click()
  }
  const stats = [['Aktif', active.length], ['Belum diverifikasi', active.filter((r) => !r.confirmed).length], ['Berhenti', rows.length - active.length]]
  return (
    <main className="wrap py-8">
      <h1 className="text-2xl font-bold">Pelanggan email</h1>
      <p className="mt-1 text-sm text-muted">Alamat email dari formulir berlangganan di website dan aplikasi. Alamat belum diverifikasi, karena konfirmasi lewat email baru bisa aktif setelah pengiriman email otomatis disiapkan.</p>
      <dl className="mt-6 grid grid-cols-3 gap-3">
        {stats.map(([l, n]) => <div key={l} className="card p-4"><dt className="text-sm text-muted">{l}</dt><dd className="text-2xl font-extrabold">{n}</dd></div>)}
      </dl>
      <div className="mt-6 flex flex-wrap gap-2">
        <input className={`${inp} min-w-[12rem] flex-1`} placeholder="Cari email" aria-label="Cari email" value={q} onChange={(e) => setQ(e.target.value)} />
        <button onClick={copy} className="btn btn-ghost">Salin email aktif</button>
        <button onClick={csv} className="btn btn-ghost">Ekspor CSV</button>
        <button onClick={load} className="btn btn-ghost">Segarkan</button>
      </div>
      <p className="mt-2 text-xs text-muted">Kirim manual lewat Gmail: tempel di kolom BCC, maksimal sekitar 50 alamat per email, dan sertakan kalimat cara berhenti berlangganan.</p>
      {msg && <p role="alert" className="mt-4 text-sm font-medium text-danger">{msg}</p>}
      {note && <p role="status" className="mt-4 text-sm font-medium text-accent">{note}</p>}
      <ul className="mt-6 space-y-3">
        {list.length === 0 && <li className="text-muted">Belum ada pelanggan.</li>}
        {list.map((r) => (
          <li key={r.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="break-all font-semibold">{r.email}</p>
              <p className="text-sm text-muted">{day(r.created_at)}, {r.unsubscribed_at ? 'berhenti' : r.confirmed ? 'terverifikasi' : 'belum diverifikasi'}</p>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-ghost !min-h-[44px]" onClick={() => toggle(r)}>{r.unsubscribed_at ? 'Aktifkan' : 'Tandai berhenti'}</button>
              <button className="btn btn-ghost !min-h-[44px] text-danger" onClick={() => remove(r)}>Hapus</button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
