import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { rupiah } from '../lib/pricing.js'
import { eligible, useClaimed, useVouchers, voucherCut, voucherLabel } from '../lib/vouchers.js'
import { addMyOrder } from '../lib/myorders.js'
import { getProfile } from '../lib/profile.js'
import { getPrefs } from '../lib/prefs.js'
import { services } from '../data.js'

const inp = 'mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base text-ink placeholder:text-muted focus:border-accent'
const pf = () => (getPrefs().autofill ? getProfile() : { name: '', wa: '', email: '', city: '', age: '' })
const normWa = (v) => { const d = v.replace(/\D/g, ''); return d.startsWith('0') ? '62' + d.slice(1) : d }
const okWa = (v) => /^628\d{8,11}$/.test(normWa(v))
const okMail = (v) => /^[a-z0-9._%+-]+@gmail\.com$/i.test(v.trim())
const newId = () => {
  const a = crypto.getRandomValues(new Uint8Array(4)), c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', d = new Date(), p = (n) => String(n).padStart(2, '0')
  return `SK-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${[...a].map((x) => c[x % c.length]).join('')}`
}
function Field({ label, error, hint, children }) {
  return (
    <label className="block text-sm font-medium">{label}{children}
      {hint && !error && <span className="mt-1 block text-xs font-normal text-muted">{hint}</span>}
      {error && <span role="alert" className="mt-1 block text-xs font-medium text-danger">{error}</span>}
    </label>
  )
}

export default function OrderModal({ pkg, onClose }) {
  const ref = useRef(null)
  const [f, setF] = useState({ name: pf().name, wa: pf().wa, email: pf().email, city: pf().city, age: pf().age, notes: '', pname: '', pcontact: '', consent: false, agree: false })
  const [needs, setNeeds] = useState([])
  const [err, setErr] = useState({})
  const [state, setState] = useState('idle')
  const [id, setId] = useState('')
  const [fail, setFail] = useState('')
  const vouchers = useVouchers(), claimed = useClaimed()
  const [vc, setVc] = useState(null), [vcode, setVcode] = useState(''), [vErr, setVErr] = useState('')
  const mine = vouchers.filter((v) => claimed.includes(v.code) && eligible(v, pkg.name))
  const vd = vc ? voucherCut(pkg.pr.final, vc) : 0
  const applyVoucher = (c) => {
    const code = c.trim().toUpperCase(); setVErr('')
    if (!code) return
    const v = vouchers.find((x) => x.code === code)
    if (!v || !eligible(v, pkg.name)) return setVErr('Voucher tidak ditemukan atau tidak berlaku untuk paket ini.')
    setVc(v); setVcode('')
  }
  useEffect(() => {
    const d = ref.current
    if (!d.open) d.showModal()
    d.addEventListener('close', onClose)
    return () => d.removeEventListener('close', onClose)
  }, [])
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const age = parseInt(f.age, 10)
  const minor = f.age !== '' && age < 17
  const toggle = (n) => setNeeds(needs.includes(n) ? needs.filter((x) => x !== n) : [...needs, n])

  async function submit(e) {
    e.preventDefault()
    const v = {}
    if (f.name.trim().length < 2) v.name = 'Isi nama lengkap.'
    if (!f.wa.trim() && !f.email.trim()) v.contact = 'Isi nomor WhatsApp atau Gmail yang aktif.'
    if (f.wa.trim() && !okWa(f.wa)) v.wa = 'Nomor WhatsApp tidak valid. Contoh: 081234567890'
    if (f.email.trim() && !okMail(f.email)) v.email = 'Gunakan alamat @gmail.com yang valid.'
    if (f.city.trim().length < 2) v.city = 'Isi kota asalmu.'
    if (!(age >= 1 && age <= 99)) v.age = 'Isi umur dengan benar.'
    if (minor) {
      if (f.pname.trim().length < 2) v.pname = 'Isi nama orang tua atau wali.'
      if (!(okWa(f.pcontact) || okMail(f.pcontact))) v.pcontact = 'Isi WhatsApp atau Gmail orang tua yang valid.'
      if (!f.consent) v.consent = 'Persetujuan orang tua diperlukan.'
    }
    if (!f.agree) v.agree = 'Centang persetujuan untuk melanjutkan.'
    if (!needs.length) v.needs = 'Pilih minimal satu kebutuhan.'
    setErr(v); setFail('')
    if (Object.keys(v).length) return
    if (!supabase) return setFail('Pemesanan online belum diaktifkan. Silakan hubungi kami lewat konsultasi.')
    setState('sending')
    for (let i = 0; i < 3; i++) {
      const oid = newId()
      const { error } = await supabase.from('orders').insert({
        id: oid, package: pkg.name, price: pkg.pr.disc > 0 ? rupiah(pkg.pr.final) : pkg.price, voucher_code: vc ? vc.code : null, needs,
        name: f.name.trim(), wa: f.wa.trim() ? normWa(f.wa) : null, email: f.email.trim().toLowerCase() || null,
        city: f.city.trim(), age, notes: f.notes.trim() || null, is_minor: minor,
        parent_name: minor ? f.pname.trim() : null, parent_contact: minor ? f.pcontact.trim() : null,
        parent_consent: minor && f.consent, status: minor ? 'menunggu_ortu' : 'baru',
      })
      if (!error) { addMyOrder(oid); setId(oid); setState('done'); return }
      if (error.code !== '23505') { setFail(/voucher/i.test(error.message) ? error.message : 'Pesanan gagal dikirim. Coba lagi sebentar lagi.'); setState('idle'); return }
    }
    setFail('Pesanan gagal dikirim. Coba lagi sebentar lagi.'); setState('idle')
  }

  return (
    <dialog ref={ref} onClick={(e) => e.target === ref.current && ref.current.close()} aria-labelledby="order-h" className="m-auto w-[calc(100%-1.5rem)] max-w-lg rounded-2xl border border-line bg-bg p-0 text-ink backdrop:bg-black/50">
      <div className="max-h-[90vh] overflow-y-auto p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <h2 id="order-h" className="text-2xl font-bold">{state === 'done' ? 'Pesanan terkirim' : `Pesan paket ${pkg.name}`}</h2>
          <button type="button" onClick={() => ref.current.close()} aria-label="Tutup" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg hover:bg-surface">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        {state === 'done' ? (
          <div className="mt-5 space-y-4">
            <p className="text-muted">Pesananmu sudah masuk ke admin. Simpan ID pesanan ini:</p>
            <p className="select-all rounded-xl bg-sand px-4 py-4 text-center text-2xl font-extrabold tracking-wide text-accent">{id}</p>
            <p className="text-muted">{minor ? 'Karena umurmu di bawah 17 tahun, pesanan menunggu verifikasi orang tua. Admin akan menghubungi kontak orang tua yang kamu isi.' : 'Admin akan menghubungimu lewat kontak yang kamu isi.'}</p>
            <button type="button" onClick={() => ref.current.close()} className="btn btn-primary w-full">Selesai</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-5 space-y-4">
            <div className="rounded-xl bg-surface p-4">
              <p className="text-xl font-extrabold">{pkg.pr.disc > 0 ? <><s className="mr-2 text-sm font-normal text-muted">{pkg.price}</s>{pkg.name === 'Custom' ? 'Mulai ' : ''}{rupiah(pkg.pr.final)}</> : pkg.price}</p>{pkg.pr.promo && <p className="text-sm font-medium text-accent">Promo: {pkg.pr.promo}</p>}{vd > 0 && <p className="text-sm font-medium text-accent">Voucher {vc.code}: potongan {rupiah(vd)}. Total {rupiah(pkg.pr.final - vd)}</p>}
              <p className="mt-1 text-sm font-medium text-accent">{pkg.stack}</p>
              <p className="mt-1 text-sm text-muted">{pkg.desc} Fitur dan detail akhir dibahas setelah pesanan masuk.</p>
            </div>
            <fieldset>
              <legend className="text-sm font-medium">Kebutuhanmu (boleh lebih dari satu)</legend>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {services.map(([n]) => (
                  <li key={n}><label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-line px-3 text-sm">
                    <input type="checkbox" className="h-4 w-4 accent-accent" checked={needs.includes(n)} onChange={() => toggle(n)} />{n}
                  </label></li>
                ))}
              </ul>
              {err.needs && <p role="alert" className="mt-1 text-xs font-medium text-danger">{err.needs}</p>}
            </fieldset>
            <div className="rounded-xl border border-line p-4">
              <p className="text-sm font-medium">Tukar voucher (opsional)</p>
              {vc ? (
                <p className="mt-2 flex items-center justify-between gap-3 text-sm"><span><strong>{vc.code}</strong> terpasang, potongan {voucherLabel(vc)}</span><button type="button" onClick={() => setVc(null)} className="font-semibold text-accent underline">Lepas</button></p>
              ) : (<>
                {mine.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{mine.map((v) => <button key={v.id} type="button" onClick={() => applyVoucher(v.code)} className="rounded-full bg-sand px-3 py-1.5 text-sm font-semibold text-accent">{v.code} ({voucherLabel(v)})</button>)}</div>}
                <div className="mt-2 flex gap-2">
                  <input className={`${inp} !mt-0 uppercase`} value={vcode} onChange={(e) => setVcode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyVoucher(vcode))} placeholder="Kode voucher" aria-label="Kode voucher" />
                  <button type="button" onClick={() => applyVoucher(vcode)} className="btn btn-ghost !min-h-[44px] shrink-0">Pakai</button>
                </div>
                {vErr && <p role="alert" className="mt-1 text-xs font-medium text-danger">{vErr}</p>}
              </>)}
            </div>
            <Field label="Nama lengkap" error={err.name}><input className={inp} value={f.name} onChange={set('name')} autoComplete="name" /></Field>
            <Field label="Nomor WhatsApp aktif" error={err.wa || err.contact} hint="Isi WhatsApp atau Gmail (boleh keduanya)."><input className={inp} value={f.wa} onChange={set('wa')} inputMode="tel" autoComplete="tel" placeholder="081234567890" /></Field>
            <Field label="Gmail aktif" error={err.email}><input className={inp} value={f.email} onChange={set('email')} inputMode="email" autoComplete="email" placeholder="nama@gmail.com" /></Field>
            <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
              <Field label="Kota" error={err.city}><input className={inp} value={f.city} onChange={set('city')} autoComplete="address-level2" /></Field>
              <Field label="Umur" error={err.age}><input className={inp} value={f.age} onChange={set('age')} inputMode="numeric" /></Field>
            </div>
            {minor && (
              <div className="space-y-4 rounded-xl border border-line p-4">
                <p className="text-sm text-muted">Umurmu di bawah 17 tahun, jadi pesanan perlu diverifikasi orang tua atau wali.</p>
                <Field label="Nama orang tua / wali" error={err.pname}><input className={inp} value={f.pname} onChange={set('pname')} /></Field>
                <Field label="WhatsApp atau Gmail orang tua / wali" error={err.pcontact}><input className={inp} value={f.pcontact} onChange={set('pcontact')} /></Field>
                <label className="flex gap-3 text-sm"><input type="checkbox" className="mt-1 h-4 w-4 accent-accent" checked={f.consent} onChange={set('consent')} />
                  <span>Orang tua / wali saya mengetahui dan menyetujui pesanan ini, dan bersedia dihubungi untuk verifikasi.{err.consent && <span role="alert" className="block text-xs font-medium text-danger">{err.consent}</span>}</span></label>
              </div>
            )}
            <Field label="Catatan (opsional)"><textarea className={inp} rows={3} value={f.notes} onChange={set('notes')} maxLength={1000} /></Field>
            <label className="flex gap-3 text-sm"><input type="checkbox" className="mt-0.5" checked={f.agree} onChange={set('agree')} /><span>Saya menyetujui <a href="/syarat-ketentuan" target="_blank" rel="noreferrer" className="font-semibold text-accent underline">Syarat &amp; Ketentuan</a> dan <a href="/kebijakan-privasi" target="_blank" rel="noreferrer" className="font-semibold text-accent underline">Kebijakan Privasi</a>.{err.agree && <span role="alert" className="block text-xs font-medium text-danger">{err.agree}</span>}</span></label>
            {fail && <p role="alert" className="text-sm font-medium text-danger">{fail}</p>}
            <button type="submit" disabled={state === 'sending'} className="btn btn-primary w-full disabled:opacity-60">{state === 'sending' ? 'Mengirim...' : 'Pesan'}</button>
          </form>
        )}
      </div>
    </dialog>
  )
}
