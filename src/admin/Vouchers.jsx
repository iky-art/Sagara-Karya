import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { packages } from '../data.js'
import { voucherLabel } from '../lib/vouchers.js'
const inp = 'w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base text-ink focus:border-accent'
const empty = { code: '', title: '', desc: '', kind: 'persen', value: '', quota: '', pk: [], start: '', end: '' }
const gen = () => { const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; return Array.from(crypto.getRandomValues(new Uint8Array(8)), (x) => c[x % c.length]).join('') }
const stt = (v) => (!v.active ? 'Nonaktif' : v.quota && v.used >= v.quota ? 'Habis' : v.starts_at && new Date(v.starts_at) > new Date() ? 'Terjadwal' : v.ends_at && new Date(v.ends_at) <= new Date() ? 'Berakhir' : 'Berjalan')
const day = (t) => (t ? new Date(t).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-')
export default function Vouchers() {
  const [rows, setRows] = useState([]), [f, setF] = useState(empty), [msg, setMsg] = useState('')
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('vouchers').select('*').order('created_at', { ascending: false })
    if (error) setMsg('Gagal memuat: ' + error.message); else setRows(data)
  }, [])
  useEffect(() => { load() }, [load])
  const togglePk = (n) => setF({ ...f, pk: f.pk.includes(n) ? f.pk.filter((x) => x !== n) : [...f.pk, n] })
  async function add(e) {
    e.preventDefault(); setMsg('')
    const code = f.code.trim().toUpperCase(), v = parseInt(f.value, 10), q = f.quota.trim() ? parseInt(f.quota, 10) : null
    if (!/^[A-Z0-9]{3,20}$/.test(code)) return setMsg('Kode harus 3-20 karakter huruf besar atau angka.')
    if (f.title.trim().length < 2 || !(v > 0) || (f.kind === 'persen' && v > 100)) return setMsg('Isi judul dan nilai potongan dengan benar (persen maksimal 100).')
    if (q !== null && !(q > 0)) return setMsg('Kuota harus lebih dari 0, atau kosongkan.')
    const { error } = await supabase.from('vouchers').insert({ code, title: f.title.trim(), description: f.desc.trim() || null, kind: f.kind, value: v, packages: f.pk, quota: q, starts_at: f.start ? new Date(f.start).toISOString() : null, ends_at: f.end ? new Date(f.end).toISOString() : null })
    if (error) return setMsg(error.code === '23505' ? 'Kode voucher itu sudah dipakai.' : 'Gagal menyimpan: ' + error.message)
    setF(empty); load()
  }
  const toggle = async (v) => { const { error } = await supabase.from('vouchers').update({ active: !v.active }).eq('id', v.id); error ? setMsg(error.message) : load() }
  const remove = async (v) => { if (!confirm(`Hapus voucher ${v.code}?`)) return; const { error } = await supabase.from('vouchers').delete().eq('id', v.id); error ? setMsg(error.message) : load() }
  return (
    <main className="wrap py-8">
      <h1 className="text-2xl font-bold">Voucher</h1>
      <p className="mt-1 text-sm text-muted">Voucher yang berjalan otomatis tampil sebagai kartu di halaman utama. Pengunjung mengambilnya lewat kartu, lalu menukarkannya saat memesan. Potongan dihitung dari harga setelah promo, dan satu voucher hanya bisa dipakai sekali per nomor WhatsApp atau Gmail.</p>
      <form onSubmit={add} className="card mt-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input className={`${inp} uppercase`} placeholder="Kode (mis. HEMAT10)" aria-label="Kode voucher" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} />
          <button type="button" className="btn btn-ghost" onClick={() => setF({ ...f, code: gen() })}>Acak kode</button>
        </div>
        <input className={inp} placeholder="Judul kartu (mis. Diskon pelanggan baru)" aria-label="Judul voucher" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <textarea className={inp} rows={3} maxLength={500} placeholder="Isi dan ketentuan (tampil saat kartu dibuka)" aria-label="Deskripsi voucher" value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} />
        <div className="grid gap-3 sm:grid-cols-3">
          <select className={inp} aria-label="Jenis potongan" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}><option value="persen">Persen (%)</option><option value="nominal">Nominal (Rp)</option></select>
          <input className={inp} inputMode="numeric" placeholder={f.kind === 'persen' ? '10' : '5000'} aria-label="Nilai potongan" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} />
          <input className={inp} inputMode="numeric" placeholder="Kuota (kosong = tanpa batas)" aria-label="Kuota" value={f.quota} onChange={(e) => setF({ ...f, quota: e.target.value })} />
        </div>
        <fieldset>
          <legend className="text-sm font-medium">Berlaku untuk paket (kosongkan = semua paket)</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {packages.map((p) => <label key={p.name} className="flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg border border-line px-3 text-sm"><input type="checkbox" checked={f.pk.includes(p.name)} onChange={() => togglePk(p.name)} />{p.name}</label>)}
          </div>
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">Mulai (opsional)<input type="datetime-local" className={`${inp} mt-1`} value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} /></label>
          <label className="text-sm font-medium">Berakhir (opsional)<input type="datetime-local" className={`${inp} mt-1`} value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} /></label>
        </div>
        {msg && <p role="alert" className="text-sm font-medium text-danger">{msg}</p>}
        <button className="btn btn-primary">Buat voucher</button>
      </form>
      <ul className="mt-6 space-y-3">
        {rows.length === 0 && <li className="text-muted">Belum ada voucher.</li>}
        {rows.map((v) => (
          <li key={v.id} className="card flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-extrabold">{v.title} <span className="ml-1 rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-accent">{stt(v)}</span></p>
              <p className="text-sm text-muted">Kode {v.code}, potongan {voucherLabel(v)}, {v.packages.length ? v.packages.join(', ') : 'semua paket'}</p>
              <p className="text-sm text-muted">Terpakai {v.used}{v.quota ? ` dari ${v.quota}` : ''}. Periode: {day(v.starts_at)} sampai {day(v.ends_at)}</p>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-ghost" onClick={() => toggle(v)}>{v.active ? 'Nonaktifkan' : 'Aktifkan'}</button>
              <button className="btn btn-ghost text-danger" onClick={() => remove(v)}>Hapus</button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
