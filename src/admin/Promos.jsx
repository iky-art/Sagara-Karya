import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { packages } from '../data.js'
import { priceFor, rupiah } from '../lib/pricing.js'
const inp = 'w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base text-ink focus:border-accent'
const empty = { name: '', kind: 'persen', value: '', pk: [], start: '', end: '' }
const stt = (p) => (!p.active ? 'Nonaktif' : p.starts_at && new Date(p.starts_at) > new Date() ? 'Terjadwal' : p.ends_at && new Date(p.ends_at) <= new Date() ? 'Berakhir' : 'Berjalan')
const day = (t) => (t ? new Date(t).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-')
export default function Promos() {
  const [rows, setRows] = useState([]), [f, setF] = useState(empty), [msg, setMsg] = useState('')
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('promos').select('*').order('created_at', { ascending: false })
    if (error) setMsg('Gagal memuat: ' + error.message); else setRows(data)
  }, [])
  useEffect(() => { load() }, [load])
  const v = parseInt(f.value, 10)
  const draft = { kind: f.kind, value: v, packages: f.pk, active: true }
  const valid = f.name.trim().length >= 2 && v > 0 && (f.kind !== 'persen' || v <= 100)
  const togglePk = (n) => setF({ ...f, pk: f.pk.includes(n) ? f.pk.filter((x) => x !== n) : [...f.pk, n] })
  async function add(e) {
    e.preventDefault(); setMsg('')
    if (!valid) return setMsg('Isi nama dan nilai promo dengan benar (persen maksimal 100).')
    const { error } = await supabase.from('promos').insert({ name: f.name.trim(), kind: f.kind, value: v, packages: f.pk, starts_at: f.start ? new Date(f.start).toISOString() : null, ends_at: f.end ? new Date(f.end).toISOString() : null })
    if (error) return setMsg('Gagal menyimpan: ' + error.message)
    setF(empty); load()
  }
  const toggle = async (p) => { const { error } = await supabase.from('promos').update({ active: !p.active }).eq('id', p.id); error ? setMsg(error.message) : load() }
  const remove = async (p) => { if (!confirm(`Hapus promo ${p.name}?`)) return; const { error } = await supabase.from('promos').delete().eq('id', p.id); error ? setMsg(error.message) : load() }
  return (
    <main className="wrap py-8">
      <h1 className="text-2xl font-bold">Promo</h1>
      <p className="mt-1 text-sm text-muted">Promo yang berjalan otomatis memotong harga di halaman paket dan pesanan baru. Jika ada beberapa promo, yang potongannya terbesar yang dipakai.</p>
      <form onSubmit={add} className="card mt-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_9rem_9rem]">
          <input className={inp} placeholder="Nama promo (mis. Promo Akhir Tahun)" aria-label="Nama promo" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <select className={inp} aria-label="Jenis potongan" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}><option value="persen">Persen (%)</option><option value="nominal">Nominal (Rp)</option></select>
          <input className={inp} inputMode="numeric" placeholder={f.kind === 'persen' ? '10' : '5000'} aria-label="Nilai potongan" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} />
        </div>
        <fieldset>
          <legend className="text-sm font-medium">Berlaku untuk paket (kosongkan = semua paket)</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {packages.map((p) => <label key={p.name} className="flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg border border-line px-3 text-sm"><input type="checkbox" className="accent-accent" checked={f.pk.includes(p.name)} onChange={() => togglePk(p.name)} />{p.name}</label>)}
          </div>
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">Mulai (opsional)<input type="datetime-local" className={`${inp} mt-1`} value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} /></label>
          <label className="text-sm font-medium">Berakhir (opsional)<input type="datetime-local" className={`${inp} mt-1`} value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} /></label>
        </div>
        {valid && (
          <p className="rounded-lg bg-surface p-3 text-sm">Pratinjau: {packages.filter((p) => !f.pk.length || f.pk.includes(p.name)).map((p) => `${p.name} ${rupiah(priceFor(p, [draft]).final)}`).join(', ')}</p>
        )}
        {msg && <p role="alert" className="text-sm font-medium text-danger">{msg}</p>}
        <button className="btn btn-primary">Buat promo</button>
      </form>
      <ul className="mt-6 space-y-3">
        {rows.length === 0 && <li className="text-muted">Belum ada promo.</li>}
        {rows.map((p) => (
          <li key={p.id} className="card flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-extrabold">{p.name} <span className="ml-1 rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-accent">{stt(p)}</span></p>
              <p className="text-sm text-muted">Potongan {p.kind === 'persen' ? `${p.value}%` : rupiah(p.value)} · {p.packages.length ? p.packages.join(', ') : 'Semua paket'}</p>
              <p className="text-sm text-muted">Periode: {day(p.starts_at)} sampai {day(p.ends_at)}</p>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-ghost" onClick={() => toggle(p)}>{p.active ? 'Nonaktifkan' : 'Aktifkan'}</button>
              <button className="btn btn-ghost text-danger" onClick={() => remove(p)}>Hapus</button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
