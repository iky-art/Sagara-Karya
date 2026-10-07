import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { rupiah } from '../lib/pricing.js'
import Promos from './Promos.jsx'
import Vouchers from './Vouchers.jsx'
import Broadcasts from './Broadcasts.jsx'
import Subscribers from './Subscribers.jsx'
import Releases from './Releases.jsx'

const ST = { baru: 'Baru', menunggu_ortu: 'Menunggu verifikasi ortu', diproses: 'Diproses', selesai: 'Selesai', dibatalkan: 'Dibatalkan' }
const tone = { baru: 'bg-sand text-accent', menunggu_ortu: 'bg-amber-100 text-amber-900', diproses: 'bg-sky-100 text-sky-900', selesai: 'bg-emerald-100 text-emerald-900', dibatalkan: 'bg-line text-muted' }
const inp = 'w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base text-ink focus:border-accent'
const when = (t) => new Date(t).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })

function Login() {
  const [e, setE] = useState(''), [p, setP] = useState(''), [m, setM] = useState('')
  const go = async (ev) => {
    ev.preventDefault(); setM('')
    const { error } = await supabase.auth.signInWithPassword({ email: e.trim(), password: p })
    if (error) setM(/invalid login/i.test(error.message) ? 'Email atau password salah.' : /not confirmed/i.test(error.message) ? 'Email belum dikonfirmasi di Supabase (Authentication > Users).' : /fetch|network/i.test(error.message) ? 'Tidak bisa terhubung ke Supabase. Periksa VITE_SUPABASE_URL dan pastikan proyek tidak paused.' : /api key/i.test(error.message) ? 'Anon key tidak valid. Periksa VITE_SUPABASE_ANON_KEY.' : 'Gagal masuk: ' + error.message)
  }
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <form onSubmit={go} className="card w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Admin Sagara Karya</h1>
        <input className={inp} type="email" placeholder="Email" autoComplete="username" value={e} onChange={(x) => setE(x.target.value)} required aria-label="Email" />
        <input className={inp} type="password" placeholder="Password" autoComplete="current-password" value={p} onChange={(x) => setP(x.target.value)} required aria-label="Password" />
        {m && <p role="alert" className="text-sm font-medium text-danger">{m}</p>}
        <button className="btn btn-primary w-full">Masuk</button>
        <a href="/app" className="block text-center text-sm text-muted hover:text-ink">Kembali ke aplikasi</a>
      </form>
    </main>
  )
}

function Dashboard() {
  const [rows, setRows] = useState([]), [q, setQ] = useState(''), [fs, setFs] = useState('semua'), [open, setOpen] = useState(null), [msg, setMsg] = useState('')
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (error) setMsg('Gagal memuat: ' + error.message); else { setRows(data); setMsg('') }
  }, [])
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t) }, [load])
  const patch = async (id, p) => {
    const { error } = await supabase.from('orders').update(p).eq('id', id)
    if (error) setMsg('Gagal menyimpan: ' + error.message); else setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)))
  }
  const remove = async (id) => {
    if (!confirm(`Hapus pesanan ${id}? Tindakan ini tidak bisa dibatalkan.`)) return
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) setMsg('Gagal menghapus: ' + error.message); else setRows((rs) => rs.filter((r) => r.id !== id))
  }
  const list = useMemo(() => rows.filter((r) => (fs === 'semua' || r.status === fs) && [r.id, r.name, r.wa, r.email, r.city].join(' ').toLowerCase().includes(q.toLowerCase())), [rows, q, fs])
  const cnt = (s) => rows.filter((r) => r.status === s).length
  const csv = () => {
    const cols = ['id', 'created_at', 'status', 'package', 'price', 'final_price', 'voucher_code', 'needs', 'name', 'wa', 'email', 'city', 'age', 'is_minor', 'parent_name', 'parent_contact', 'parent_verified', 'notes', 'admin_note']
    const esc = (v) => { let s = String(Array.isArray(v) ? v.join('; ') : v ?? ''); if (/^[=+\-@]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"` }
    const t = [cols.join(','), ...list.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t], { type: 'text/csv' })); a.download = 'pesanan-sagara-karya.csv'; a.click()
  }
  const stats = [['Total', rows.length], ['Baru', cnt('baru')], ['Menunggu ortu', cnt('menunggu_ortu')], ['Diproses', cnt('diproses')], ['Selesai', cnt('selesai')]]
  return (
    <main className="wrap py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Pesanan</h1>
        <div className="flex gap-2">
          <button onClick={load} className="btn btn-ghost">Segarkan</button>
          <button onClick={csv} className="btn btn-ghost">Ekspor CSV</button>
          <button onClick={() => supabase.auth.signOut()} className="btn btn-ghost">Keluar</button>
        </div>
      </header>
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map(([l, n]) => <div key={l} className="card p-4"><dt className="text-sm text-muted">{l}</dt><dd className="text-2xl font-extrabold">{n}</dd></div>)}
      </dl>
      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_14rem]">
        <input className={inp} placeholder="Cari ID, nama, kontak, kota" aria-label="Cari pesanan" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inp} aria-label="Filter status" value={fs} onChange={(e) => setFs(e.target.value)}>
          <option value="semua">Semua status</option>
          {Object.entries(ST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      {msg && <p role="alert" className="mt-4 text-sm font-medium text-danger">{msg}</p>}
      <ul className="mt-6 space-y-3">
        {list.length === 0 && <li className="text-muted">Belum ada pesanan yang cocok.</li>}
        {list.map((o) => (
          <li key={o.id} className="card p-0">
            <button onClick={() => setOpen(open === o.id ? null : o.id)} aria-expanded={open === o.id} className="flex w-full flex-wrap items-center justify-between gap-2 p-4 text-left">
              <span><span className="block font-extrabold">{o.id}</span><span className="text-sm text-muted">{o.name}, {o.city} · {o.package} · {when(o.created_at)}</span></span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[o.status]}`}>{ST[o.status]}</span>
            </button>
            {open === o.id && (
              <div className="space-y-4 border-t border-line p-4">
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  {[['Paket', o.package + ' (' + (o.final_price != null ? rupiah(o.final_price) : o.price) + (o.promo_name ? ', promo ' + o.promo_name : '') + ')'], ['Kebutuhan', (o.needs || []).join(', ')], ['Umur', `${o.age} tahun`], ['Kota', o.city], ['Catatan', o.notes || '-'], ['Voucher', o.voucher_code ? o.voucher_code + ' (potongan ' + rupiah(o.voucher_discount || 0) + ')' : '-']].map(([k, v]) => <div key={k}><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}
                  <div><dt className="text-muted">WhatsApp</dt><dd className="font-medium">{o.wa ? <a className="text-accent underline" href={`https://wa.me/${o.wa}`} target="_blank" rel="noreferrer">{o.wa}</a> : '-'}</dd></div>
                  <div><dt className="text-muted">Gmail</dt><dd className="font-medium">{o.email ? <a className="text-accent underline" href={`mailto:${o.email}`}>{o.email}</a> : '-'}</dd></div>
                </dl>
                {o.is_minor && (
                  <div className="rounded-xl bg-surface p-4 text-sm">
                    <p className="font-semibold">Di bawah 17 tahun: perlu verifikasi orang tua</p>
                    <p className="mt-1">Orang tua / wali: {o.parent_name}, {o.parent_contact}</p>
                    <p className="text-muted">Centang persetujuan di form: {o.parent_consent ? 'ya' : 'tidak'}. Status verifikasi: {o.parent_verified ? 'sudah terverifikasi' : 'belum'}.</p>
                    {!o.parent_verified && <button className="btn btn-primary mt-3" onClick={() => patch(o.id, { parent_verified: true, status: o.status === 'menunggu_ortu' ? 'baru' : o.status })}>Tandai orang tua terverifikasi</button>}
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-[14rem_1fr]">
                  <select className={inp} aria-label="Ubah status" value={o.status} onChange={(e) => patch(o.id, { status: e.target.value })}>
                    {Object.entries(ST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <textarea className={inp} rows={2} aria-label="Catatan admin" placeholder="Catatan admin (tersimpan saat keluar dari kolom)" defaultValue={o.admin_note || ''} onBlur={(e) => e.target.value !== (o.admin_note || '') && patch(o.id, { admin_note: e.target.value })} />
                </div>
                <button className="text-sm font-semibold text-danger underline" onClick={() => remove(o.id)}>Hapus pesanan</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}

function Shell() {
  const [tab, setTab] = useState('pesanan')
  const t = (k, l) => <button onClick={() => setTab(k)} aria-pressed={tab === k} className={`btn ${tab === k ? 'btn-primary' : 'btn-ghost'}`}>{l}</button>
  return (<><nav aria-label="Menu admin" className="wrap flex gap-2 overflow-x-auto pt-6">{t('pesanan', 'Pesanan')}{t('promo', 'Promo')}{t('voucher', 'Voucher')}{t('broadcast', 'Broadcast')}{t('pelanggan', 'Pelanggan')}{t('rilis', 'Rilis')}<a href="/app" className="btn btn-ghost ml-auto whitespace-nowrap">Ke aplikasi</a></nav>{tab === 'pesanan' ? <Dashboard /> : tab === 'promo' ? <Promos /> : tab === 'voucher' ? <Vouchers /> : tab === 'pelanggan' ? <Subscribers /> : tab === 'rilis' ? <Releases /> : <Broadcasts />}</>)
}

export default function Admin() {
  const [s, setS] = useState(undefined)
  useEffect(() => {
    document.title = 'Admin'
    const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex,nofollow'; document.head.appendChild(m)
    if (!supabase) { setS(null); return () => m.remove() }
    supabase.auth.getSession().then(({ data }) => setS(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, ses) => setS(ses))
    return () => { sub.subscription.unsubscribe(); m.remove() }
  }, [])
  if (!supabase) return <main className="wrap py-20"><p>Supabase belum dikonfigurasi. Isi file .env (lihat .env.example).</p></main>
  if (s === undefined) return null
  return s ? <Shell /> : <Login />
}
