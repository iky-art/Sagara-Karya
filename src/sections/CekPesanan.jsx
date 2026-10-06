import { useEffect, useState } from 'react'
import Reveal from '../components/Reveal.jsx'
import { ADMIN_UUID, supabase } from '../lib/supabase.js'
import { rupiah } from '../lib/pricing.js'
const ST = { baru: 'Baru', menunggu_ortu: 'Menunggu verifikasi orang tua', diproses: 'Diproses', selesai: 'Selesai', dibatalkan: 'Dibatalkan' }
const INFO = {
  baru: 'Pesananmu sudah masuk dan menunggu admin.',
  menunggu_ortu: 'Admin akan menghubungi orang tua / wali untuk verifikasi.',
  diproses: 'Pesananmu sedang dikerjakan.',
  selesai: 'Pesananmu sudah selesai.',
  dibatalkan: 'Pesanan ini dibatalkan.',
}
const when = (t) => new Date(t).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })
export default function CekPesanan({ initial = '', compact = false, allowAdmin = false }) {
  const [id, setId] = useState(initial), [r, setR] = useState(null), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => { if (initial) cek(null, initial) }, [])
  async function cek(e, val) {
    e?.preventDefault(); setMsg(''); setR(null)
    const v = (val ?? id).trim().toUpperCase()
    if (allowAdmin && ADMIN_UUID && v.toLowerCase() === ADMIN_UUID.toLowerCase()) return location.assign(`/${ADMIN_UUID}/admin`)
    if (allowAdmin && /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/.test(v)) return setMsg(ADMIN_UUID ? 'Kode admin tidak cocok dengan VITE_ADMIN_UUID di build ini.' : 'Kode admin belum aktif di build ini. Isi VITE_ADMIN_UUID lalu build ulang.')
    if (!/^SK-\d{6}-[A-Z0-9]{4}$/.test(v)) return setMsg('Format ID tidak sesuai. Contoh: SK-261004-A7K2')
    if (!supabase) return setMsg('Cek pesanan belum aktif.')
    setBusy(true)
    const { data, error } = await supabase.rpc('cek_pesanan', { p_id: v })
    setBusy(false)
    if (error) return setMsg('Gagal memeriksa pesanan. Coba lagi sebentar lagi.')
    if (!data?.length) return setMsg('Pesanan tidak ditemukan. Periksa kembali ID-nya.')
    setR(data[0])
  }
  const steps = r && [
    ['Pesanan masuk', true],
    ...(r.is_minor ? [['Verifikasi orang tua', r.parent_verified]] : []),
    ['Diproses', ['diproses', 'selesai'].includes(r.status)],
    ['Selesai', r.status === 'selesai'],
  ]
  const rows = r && [
    ['Nama', r.name_masked], ['Paket', r.package], ['Kebutuhan', (r.needs || []).join(', ')], ['Tanggal pesan', when(r.created_at)],
    ['Verifikasi orang tua', r.is_minor ? (r.parent_verified ? 'Sudah terverifikasi' : 'Belum terverifikasi') : 'Tidak diperlukan (umur 17+)'],
  ]
  return (
    <section id="cek" className={compact ? 'py-1' : 'section'}>
      <div className={compact ? 'grid gap-6' : 'wrap grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16'}>
        <div>
          {!compact && <Reveal as="h2" className="text-3xl font-bold leading-tight md:text-5xl">Cek pesanan</Reveal>}
          <p className="mt-4 max-w-sm text-muted">Masukkan ID pesanan yang kamu terima saat memesan.</p>
          <form onSubmit={cek} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input value={id} onChange={(e) => setId(e.target.value)} placeholder="SK-261004-A7K2" aria-label="ID pesanan" autoCapitalize="characters" className="min-h-[46px] w-full rounded-lg border border-line bg-bg px-3 text-base uppercase focus:border-accent" />
            <button disabled={busy} className="btn btn-primary disabled:opacity-60">{busy ? 'Memeriksa...' : 'Cek'}</button>
          </form>
          {msg && <p role="alert" className="mt-3 text-sm font-medium text-danger">{msg}</p>}
        </div>
        {r && (
          <div className="card" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xl font-extrabold">{r.id}</p>
              <span className="rounded-full bg-sand px-3 py-1 text-sm font-semibold text-accent">{ST[r.status]}</span>
            </div>
            <p className="mt-2 text-muted">{INFO[r.status]}</p>
            <ol className="mt-5 space-y-3">
              {steps.map(([l, done]) => (
                <li key={l} className="flex items-center gap-3">
                  <span className={`grid h-6 w-6 place-items-center rounded-full border text-xs ${done && r.status !== 'dibatalkan' ? 'border-accent bg-accent text-onaccent' : 'border-line text-muted'}`} aria-hidden="true">{done && r.status !== 'dibatalkan' ? '✓' : ''}</span>
                  <span className={done ? 'font-medium' : 'text-muted'}>{l}{done ? '' : ' (belum)'}</span>
                </li>
              ))}
            </ol>
            <dl className="mt-6 grid gap-3 border-t border-line pt-5 text-sm sm:grid-cols-2">
              {rows.map(([k, v]) => <div key={k}><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}
              {r.final_price != null && (
                <div><dt className="text-muted">Harga</dt><dd className="font-medium">{(r.discount > 0 || r.voucher_discount > 0) && <s className="mr-2 text-muted">{rupiah(r.base_price)}</s>}{rupiah(r.final_price)}{r.promo_name ? ` (promo ${r.promo_name})` : ''}{r.voucher_code ? ` + voucher ${r.voucher_code}` : ''}</dd></div>
              )}
            </dl>
          </div>
        )}
      </div>
    </section>
  )
}
