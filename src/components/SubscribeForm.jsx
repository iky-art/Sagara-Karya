import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
const KEY = 'sk-sub'
const saved = () => { try { return localStorage.getItem(KEY) } catch (e) { return null } }
export default function SubscribeForm() {
  const [email, setEmail] = useState(''), [agree, setAgree] = useState(false), [trap, setTrap] = useState('')
  const [ok, setOk] = useState(!!saved()), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const finish = (v) => { try { localStorage.setItem(KEY, v) } catch (e) {} setOk(true) }
  async function submit(e) {
    e.preventDefault(); setErr('')
    const v = email.trim().toLowerCase()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) || v.length > 120) return setErr('Masukkan alamat email yang valid.')
    if (!agree) return setErr('Centang persetujuan untuk melanjutkan.')
    if (trap) return finish(v)
    if (!supabase) return setErr('Berlangganan belum aktif.')
    setBusy(true)
    const { error } = await supabase.from('subscribers').insert({ email: v, consent: true })
    setBusy(false)
    if (error && error.code !== '23505') return setErr('Gagal mendaftar. Coba lagi sebentar lagi.')
    finish(v)
  }
  if (ok) {
    return (
      <div role="status">
        <p className="text-lg font-bold">Terima kasih, emailmu sudah tercatat.</p>
        <p className="mt-1 text-sm text-muted">Kami akan mengirim pengumuman, voucher, dan promo ke sana. Kamu bisa berhenti kapan saja.</p>
        <button type="button" onClick={() => { try { localStorage.removeItem(KEY) } catch (e) {} setOk(false) }} className="mt-3 text-sm font-semibold text-accent underline">Daftarkan email lain</button>
      </div>
    )
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <input value={trap} onChange={(e) => setTrap(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      <input type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" aria-label="Alamat email" className="min-h-[50px] w-full rounded-full border border-line bg-bg px-5 text-base focus:border-accent" />
      <label className="flex gap-3 text-sm">
        <input type="checkbox" className="mt-0.5" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span>Saya berusia 17 tahun ke atas (atau mendapat izin orang tua atau wali) dan setuju menerima pengumuman, voucher, dan promo lewat email. Detailnya ada di <a href="/kebijakan-privasi" target="_blank" rel="noreferrer" className="font-semibold text-accent underline">Kebijakan Privasi</a>.</span>
      </label>
      {err && <p role="alert" className="text-sm font-medium text-danger">{err}</p>}
      <button disabled={busy} className="btn btn-primary w-full disabled:opacity-60">{busy ? 'Mendaftar...' : 'Berlangganan'}</button>
    </form>
  )
}
