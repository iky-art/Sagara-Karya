import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { APP_VERSION, BUILD_ID } from '../lib/version.js'
import { gt, latestOf } from '../lib/release.js'
const inp = 'w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base text-ink focus:border-accent'
const bump = (v, k) => { const [a, b, c] = v.split('.').map(Number); return k === 'major' ? `${a + 1}.0.0` : k === 'minor' ? `${a}.${b + 1}.0` : `${a}.${b}.${c + 1}` }
const day = (t) => new Date(t).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
export default function Releases() {
  const [rows, setRows] = useState([]), [msg, setMsg] = useState(''), [dep, setDep] = useState(null)
  const [f, setF] = useState({ version: '', title: '', notes: '', wajib: false })
  const latest = latestOf(rows)
  const base = latest ? latest.version : '1.0.0'
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('releases').select('*').order('created_at', { ascending: false })
    if (error) setMsg('Gagal memuat: ' + error.message); else { setRows(data); setMsg('') }
  }, [])
  useEffect(() => { load(); fetch('/version.json?t=' + Date.now(), { cache: 'no-store' }).then((r) => r.json()).then(setDep).catch(() => {}) }, [load])
  useEffect(() => { setF((x) => (x.version ? x : { ...x, version: bump(base, 'patch') })) }, [base])
  async function publish(e) {
    e.preventDefault(); setMsg('')
    const version = f.version.trim(), notes = f.notes.split('\n').map((x) => x.trim()).filter(Boolean)
    if (!/^\d+\.\d+\.\d+$/.test(version)) return setMsg('Format versi harus angka.angka.angka, misalnya 1.2.0.')
    if (latest && !gt(version, latest.version)) return setMsg(`Versi harus lebih tinggi dari versi aktif (${latest.version}).`)
    if (!notes.length) return setMsg('Isi minimal satu catatan rilis (satu baris per poin).')
    if (!confirm(`Terbitkan versi ${version}? Semua pengguna akan ditawari pembaruan${f.wajib ? ' dan aplikasinya dimuat ulang otomatis' : ''}.`)) return
    const { error } = await supabase.from('releases').insert({ version, title: f.title.trim() || null, notes, wajib: f.wajib })
    if (error) return setMsg(error.code === '23505' ? 'Versi itu sudah pernah diterbitkan.' : 'Gagal menerbitkan: ' + error.message)
    setF({ version: bump(version, 'patch'), title: '', notes: '', wajib: false }); load()
  }
  const remove = async (r) => { if (!confirm(`Hapus rilis ${r.version}?`)) return; const { error } = await supabase.from('releases').delete().eq('id', r.id); error ? setMsg(error.message) : load() }
  return (
    <main className="wrap py-8">
      <h1 className="text-2xl font-bold">Rilis dan versi</h1>
      <div className="card mt-4 space-y-1 text-sm">
        <p>Versi aktif di semua perangkat: <strong>{latest ? latest.version : `belum ada rilis (memakai versi build ${APP_VERSION})`}</strong></p>
        <p className="text-muted">Deploy terakhir di server: {dep ? `${dep.version}, build ${dep.build}` : '-'}. Halaman admin ini dimuat dari build {BUILD_ID}.</p>
      </div>
      <p className="mt-3 text-sm text-muted">Terbitkan rilis <strong>setelah deploy Cloudflare berstatus Success</strong>. Pengguna akan melihat kartu pembaruan berisi catatan rilis, dan setelah memperbarui mereka mendapat kode terbaru dengan nomor versi yang kamu tetapkan. Rilis tidak mengubah kode, hanya mengumumkan dan memaksa pemuatan ulang.</p>
      <form onSubmit={publish} className="card mt-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <input className={`${inp} !w-36`} value={f.version} onChange={(e) => setF({ ...f, version: e.target.value })} inputMode="decimal" aria-label="Nomor versi" />
          {[['patch', 'Patch +1'], ['minor', 'Minor +1'], ['major', 'Major +1']].map(([k, l]) => <button key={k} type="button" className="btn btn-ghost !min-h-[44px]" onClick={() => setF({ ...f, version: bump(base, k) })}>{l}</button>)}
        </div>
        <input className={inp} maxLength={80} placeholder="Judul rilis (opsional, mis. Setelan baru)" aria-label="Judul rilis" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <textarea className={inp} rows={5} placeholder={'Catatan rilis, satu poin per baris\nContoh:\nSetelan kini punya pencarian\nPerbaikan tampilan voucher'} aria-label="Catatan rilis" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
        <label className="flex cursor-pointer items-start gap-3 text-sm"><input type="checkbox" className="mt-0.5" checked={f.wajib} onChange={(e) => setF({ ...f, wajib: e.target.checked })} /><span>Wajib perbarui: aplikasi di semua perangkat dimuat ulang otomatis saat terdeteksi (kecuali ada jendela yang sedang terbuka).</span></label>
        {msg && <p role="alert" className="text-sm font-medium text-danger">{msg}</p>}
        <button className="btn btn-primary">Terbitkan pembaruan</button>
      </form>
      <ul className="mt-6 space-y-3">
        {rows.length === 0 && <li className="text-muted">Belum ada rilis.</li>}
        {rows.map((r) => (
          <li key={r.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <p className="font-extrabold">Versi {r.version}{r.wajib ? ' (wajib)' : ''}{latest && latest.id === r.id ? ' (aktif)' : ''}</p>
              <button className="text-sm font-semibold text-danger underline" onClick={() => remove(r)}>Hapus</button>
            </div>
            <p className="text-xs text-muted">{day(r.created_at)}{r.title ? `, ${r.title}` : ''}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">{r.notes.map((n) => <li key={n}>{n}</li>)}</ul>
          </li>
        ))}
      </ul>
    </main>
  )
}
