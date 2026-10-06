import { useState } from 'react'
import Logo from '../components/Logo.jsx'
import OrderModal from '../components/OrderModal.jsx'
import VoucherModal from '../components/VoucherModal.jsx'
import CekPesanan from '../sections/CekPesanan.jsx'
import { channels, faqs, packages, services, steps } from '../data.js'
import { priceFor, rupiah, usePromos } from '../lib/pricing.js'
import { useClaimed, useVouchers, voucherLabel } from '../lib/vouchers.js'
import { markAllRead, openCenter, unreadOf, useBroadcasts } from '../lib/broadcast.js'
import { install, useInstall } from '../lib/pwa.js'
import { buzz, setPref, usePrefs } from '../lib/prefs.js'
import { openContact } from '../lib/contact.js'
import { getProfile, saveProfile } from '../lib/profile.js'
import { getMode, setMode } from '../lib/theme.js'
import { useMyOrders } from '../lib/myorders.js'

export const I = {
  home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10', box: 'M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
  ticket: 'M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4zM14 7v10', sliders: 'M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M8 15v4',
  bell: 'M6 9a6 6 0 1 1 12 0c0 6 2 7.5 2 7.5H4S6 15 6 9zM10 20a2 2 0 0 0 4 0', chev: 'M9 6l6 6-6 6', back: 'M15 6l-6 6 6 6',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4', dl: 'M12 4v10M8 10l4 4 4-4M5 19h14',
  doc: 'M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6', shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
}
Object.assign(I, {
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  help: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01',
  share: 'M12 15V3M8 7l4-4 4 4M5 12v7h14v-7', refresh: 'M20 11a8 8 0 0 0-14-4M4 4v4h4M4 13a8 8 0 0 0 14 4M20 20v-4h-4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3', steps: 'M5 5h4v4H5zM15 15h4v4h-4zM9 7h4a2 2 0 0 1 2 2v6',
  chat: 'M4 5h16v11H9l-5 4z', sparkle: 'M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z', play: 'M7 4l12 8-12 8z',
  vibrate: 'M8 5h8v14H8zM4 9v6M20 9v6', text: 'M4 7V5h16v2M12 5v14M9 19h6', check: 'M5 12.5l4.5 4.5L19 7',
})
export const Ico = ({ d, size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}><path d={d} /></svg>
)
const day = (t) => new Date(t).toLocaleDateString('id-ID', { dateStyle: 'medium' })

function VoucherCard({ v, onOpen }) {
  const got = useClaimed().includes(v.code)
  return (
    <button type="button" onClick={() => onOpen(v)} className="card block w-full text-left">
      <span className="block text-4xl font-extrabold tracking-tight">{voucherLabel(v)}</span>
      <span className="mt-1 block text-sm font-semibold text-accent">{got ? 'Sudah diambil' : 'Ketuk untuk ambil'}</span>
      <span className="mt-3 block text-lg font-bold leading-snug">{v.title}</span>
      <span className="mt-1 block text-sm text-muted">{v.ends_at ? `Sampai ${day(v.ends_at)}` : 'Tanpa batas waktu'}{v.quota ? `, sisa ${v.quota - v.used}` : ''}</span>
    </button>
  )
}

export function Home({ go, openSub }) {
  const vs = useVouchers()
  const [sel, setSel] = useState(null)
  const tiles = [['Paket & harga', I.box, () => go('paket')], ['Lacak pesanan', I.search, () => openSub('lacak')], ['Voucher', I.ticket, () => go('voucher')], ['Notifikasi', I.bell, openCenter]]
  return (
    <div className="space-y-6">
      <section className="glass rounded-[32px] p-6">
        <Logo className="h-14 w-14" />
        <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight">Situs yang rapi. Identitas yang <span className="grad-text">punya tempat.</span></h1>
        <p className="mt-3 text-muted">Website dan identitas digital yang sederhana, profesional, dan sesuai kebutuhanmu.</p>
        <button type="button" onClick={() => go('paket')} className="btn btn-primary mt-5 w-full">Pesan sekarang</button>
      </section>
      <div className="grid grid-cols-2 gap-3">
        {tiles.map(([l, d, fn]) => (
          <button key={l} type="button" onClick={fn} className="glass flex flex-col items-start gap-3 rounded-3xl p-4 text-left">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sand text-accent"><Ico d={d} /></span>
            <span className="font-semibold">{l}</span>
          </button>
        ))}
      </div>
      <section>
        <h2 className="mb-2 px-2 text-sm font-semibold text-muted">Layanan</h2>
        <ul className="glass overflow-hidden rounded-3xl">
          {services.map(([t, d]) => <li key={t} className="border-t border-line p-4 first:border-0"><p className="font-bold">{t}</p><p className="text-sm text-muted">{d}</p></li>)}
        </ul>
      </section>
      {vs.length > 0 && (
        <section>
          <h2 className="mb-2 px-2 text-sm font-semibold text-muted">Voucher untukmu</h2>
          <div className="space-y-3">{vs.slice(0, 2).map((v) => <VoucherCard key={v.id} v={v} onOpen={setSel} />)}</div>
        </section>
      )}
      {sel && <VoucherModal v={sel} onClose={() => setSel(null)} />}
    </div>
  )
}

export function Paket() {
  const promos = usePromos()
  const [sel, setSel] = useState(null)
  return (
    <div className="space-y-4">
      {packages.map((p) => {
        const pr = priceFor(p, promos)
        return (
          <section key={p.name} className="card">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold">{p.name}</h2>
              {pr.promo && <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-accent">Promo: {pr.promo}</span>}
            </div>
            {pr.disc > 0 && <p className="mt-2 text-sm"><s className="text-muted">{p.price}</s> <span className="font-semibold text-accent">Hemat {rupiah(pr.disc)}</span></p>}
            <p className={`${pr.disc > 0 ? 'mt-1' : 'mt-2'} text-3xl font-extrabold tracking-tight`}>{pr.disc > 0 ? (p.name === 'Custom' ? 'Mulai ' : '') + rupiah(pr.final) : p.price}</p>
            <p className="mt-3 w-fit rounded-lg bg-sand px-3 py-1.5 text-sm font-medium text-accent">{p.stack}</p>
            <p className="mt-3 text-muted">{p.desc}</p>
            <button type="button" onClick={() => setSel({ ...p, pr })} className="btn btn-primary mt-5 w-full">Pilih Paket</button>
          </section>
        )
      })}
      <p className="px-2 text-sm text-muted">Fitur di luar yang tertulis di atas, termasuk domain dan hosting, tidak otomatis termasuk dan dibicarakan saat konsultasi.</p>
      {sel && <OrderModal pkg={sel} onClose={() => setSel(null)} />}
    </div>
  )
}

export function Voucher() {
  const vs = useVouchers()
  const [sel, setSel] = useState(null)
  return (
    <div className="space-y-3">
      {vs.length === 0 && <p className="glass rounded-3xl p-6 text-muted">Belum ada voucher saat ini. Cek lagi nanti.</p>}
      {vs.map((v) => <VoucherCard key={v.id} v={v} onOpen={setSel} />)}
      {sel && <VoucherModal v={sel} onClose={() => setSel(null)} />}
    </div>
  )
}

const inp = 'mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base'
const cap = 'mb-2 px-2 text-sm font-semibold text-muted'

function Group({ title, children }) {
  return (
    <section>
      <h2 className={cap}>{title}</h2>
      <div className="glass overflow-hidden rounded-3xl divide-y divide-line">{children}</div>
    </section>
  )
}
function Row({ icon, label, hint, onClick, href, right, danger }) {
  const cls = 'flex w-full items-center gap-3 p-4 text-left'
  const inner = (
    <>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sand text-accent"><Ico d={icon} size={20} /></span>
      <span className="min-w-0 flex-1"><span className={`block font-semibold ${danger ? 'text-danger' : ''}`}>{label}</span>{hint && <span className="block text-sm text-muted">{hint}</span>}</span>
      {right ?? <Ico d={I.chev} size={18} className="text-muted" />}
    </>
  )
  return href ? <a href={href} className={cls}>{inner}</a> : <button type="button" onClick={onClick} className={cls}>{inner}</button>
}
function Switch({ on, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${on ? 'bg-accent' : 'bg-ink/20'}`}>
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'left-7' : 'left-1'}`} />
    </button>
  )
}
function Item({ icon, label, hint, on, onChange }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sand text-accent"><Ico d={icon} size={20} /></span>
      <span className="min-w-0 flex-1"><span className="block font-semibold">{label}</span>{hint && <span className="block text-sm text-muted">{hint}</span>}</span>
      <Switch on={on} onChange={onChange} label={label} />
    </div>
  )
}
function Seg({ caption, value, options, onChange }) {
  return (
    <div>
      <p className="mb-1.5 px-2 text-xs text-muted">{caption}</p>
      <div className="glass flex gap-1 rounded-full p-1.5" role="group" aria-label={caption}>
        {options.map(([k, l]) => (
          <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)} className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors ${value === k ? 'bg-ink text-bg' : 'text-muted'}`}>{l}</button>
        ))}
      </div>
    </div>
  )
}

export function Setelan({ openSub }) {
  const [mode, setM] = useState(getMode)
  const pr = usePrefs()
  const nb = useBroadcasts(), unread = unreadOf(nb).length
  const claimed = useClaimed()
  const ins = useInstall()
  const [msg, setMsg] = useState('')
  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(''), 2200) }
  const pickTheme = (m) => { buzz(); setMode(m); setM(m) }
  const pref = (k) => (v) => { setPref(k, v); buzz() }
  const name = getProfile().name
  const share = async () => {
    const data = { title: 'Sagara Karya', text: 'Studio digital untuk website dan identitas digital.', url: location.origin }
    try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(data.url); flash('Tautan disalin') } } catch (e) {}
  }
  const refresh = async () => {
    flash('Memeriksa pembaruan...')
    try {
      const reg = await navigator.serviceWorker?.getRegistration(); await reg?.update()
      const ks = await caches.keys(); await Promise.all(ks.map((k) => caches.delete(k)))
    } catch (e) {}
    location.reload()
  }
  const wipe = () => {
    if (!confirm('Hapus voucher yang diambil, pesanan tersimpan, profil, dan semua pengaturan di perangkat ini?')) return
    ;['sk-vouchers', 'sk-orders', 'sk-read', 'sk-prefs', 'sk-profile', 'sk-theme', 'sk-install-dismissed'].forEach((k) => { try { localStorage.removeItem(k) } catch (e) {} })
    try { sessionStorage.clear() } catch (e) {}
    location.reload()
  }
  return (
    <div className="space-y-6">
      <Group title="Akun">
        <Row icon={I.user} label="Profil saya" hint={name || 'Isi data agar pemesanan lebih cepat'} onClick={() => openSub('profil')} />
        <Row icon={I.search} label="Lacak pesanan" hint="Cek status dengan ID pesanan" onClick={() => openSub('lacak')} />
        <Row icon={I.ticket} label="Voucher saya" hint={claimed.length ? `${claimed.length} voucher diambil` : 'Belum ada yang diambil'} onClick={() => openSub('voucherku')} />
      </Group>
      <Group title="Notifikasi">
        <Row icon={I.bell} label="Pusat notifikasi" hint={unread > 0 ? `${unread} belum dibaca` : 'Tidak ada yang baru'} onClick={openCenter}
          right={unread > 0 ? <span className="grid h-6 min-w-[24px] place-items-center rounded-full bg-accent px-1.5 text-xs font-bold text-onaccent">{unread}</span> : undefined} />
        <Item icon={I.bell} label="Banner notifikasi" hint="Tampilkan pemberitahuan di bagian atas layar" on={pr.banner} onChange={pref('banner')} />
        <Row icon={I.check} label="Tandai semua dibaca" right={<span />} onClick={() => { markAllRead(); flash('Semua ditandai dibaca') }} />
      </Group>
      <section>
        <h2 className={cap}>Tampilan</h2>
        <div className="space-y-4">
          <Seg caption="Tema" value={mode} onChange={pickTheme} options={[['light', 'Terang'], ['dark', 'Gelap'], ['system', 'Sistem']]} />
          <Seg caption="Ukuran teks" value={pr.text} onChange={pref('text')} options={[['small', 'Kecil'], ['normal', 'Normal'], ['large', 'Besar']]} />
          <div className="glass overflow-hidden rounded-3xl divide-y divide-line">
            <Item icon={I.sparkle} label="Efek kaca" hint="Matikan jika aplikasi terasa berat" on={pr.glass} onChange={pref('glass')} />
            <Item icon={I.play} label="Animasi" hint="Matikan untuk mengurangi gerakan" on={pr.motion} onChange={pref('motion')} />
            <Item icon={I.home} label="Splash saat dibuka" on={pr.splash} onChange={pref('splash')} />
            <Item icon={I.vibrate} label="Getaran" hint="Getar singkat saat menekan tombol" on={pr.haptic} onChange={pref('haptic')} />
          </div>
        </div>
      </section>
      <Group title="Bantuan">
        <Row icon={I.help} label="Pertanyaan umum" onClick={() => openSub('faq')} />
        <Row icon={I.steps} label="Cara kerja" hint="Dari cerita sampai website siap" onClick={() => openSub('cara')} />
        {channels.length === 1 ? <Row icon={I.chat} label="Hubungi kami" hint={channels[0].label} href={channels[0].href} /> : channels.length > 1 ? <Row icon={I.chat} label="Hubungi kami" hint="WhatsApp atau Gmail" onClick={openContact} /> : <Row icon={I.chat} label="Hubungi kami" hint="Lewat Mulai Konsultasi saat memesan paket" right={<span />} />}
        <Row icon={I.share} label="Bagikan aplikasi" right={<span />} onClick={share} />
      </Group>
      <Group title="Aplikasi">
        {!ins.standalone && (ins.can || ins.ios) && (
          <Row icon={I.dl} label="Pasang aplikasi" hint={ins.can ? 'Tambahkan ke layar utama' : 'Ketuk Bagikan di Safari, lalu Tambah ke Layar Utama'} onClick={ins.can ? install : undefined} right={ins.can ? undefined : <span />} />
        )}
        <Row icon={I.refresh} label="Perbarui aplikasi" hint="Muat ulang versi terbaru" right={<span />} onClick={refresh} />
        <Row icon={I.trash} label="Hapus data di perangkat" hint="Voucher, pesanan tersimpan, profil, pengaturan" danger right={<span />} onClick={wipe} />
      </Group>
      <Group title="Informasi">
        <Row icon={I.doc} label="Syarat & Ketentuan" href="/syarat-ketentuan" />
        <Row icon={I.shield} label="Kebijakan Privasi" href="/kebijakan-privasi" />
        <Row icon={I.globe} label="Lihat versi website" href="/?web=1" />
      </Group>
      <section className="glass flex items-center gap-4 rounded-3xl p-5">
        <Logo className="h-12 w-12" />
        <div><p className="font-bold">Sagara <span className="grad-text">Karya</span></p><p className="text-sm text-muted">Studio digital untuk website dan identitas digital. Versi 1.0.0</p></div>
      </section>
      {msg && <p role="status" className="solid fixed left-1/2 z-50 w-fit -translate-x-1/2 rounded-full px-4 py-2 text-sm font-medium bottom-[calc(env(safe-area-inset-bottom)+5.5rem)]">{msg}</p>}
    </div>
  )
}

export function Profil() {
  const [f, setF] = useState(getProfile)
  const [ok, setOk] = useState(false)
  const set = (k) => (e) => { setOk(false); setF({ ...f, [k]: e.target.value }) }
  const save = (e) => { e.preventDefault(); saveProfile(Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.trim()]))); setOk(true); buzz() }
  const clear = () => { const e = { name: '', wa: '', email: '', city: '', age: '' }; setF(e); saveProfile(e); setOk(false) }
  const fields = [['name', 'Nama lengkap', 'name', 'text'], ['wa', 'Nomor WhatsApp', 'tel', 'tel'], ['email', 'Gmail', 'email', 'email'], ['city', 'Kota', 'address-level2', 'text'], ['age', 'Umur', 'off', 'numeric']]
  return (
    <form onSubmit={save} className="space-y-4">
      <p className="px-2 text-sm text-muted">Data ini hanya disimpan di perangkatmu dan dipakai untuk mengisi form pemesanan otomatis. Kamu tetap bisa mengubahnya saat memesan.</p>
      <div className="card space-y-4">
        {fields.map(([k, l, ac, im]) => (
          <label key={k} className="block text-sm font-medium">{l}<input className={inp} value={f[k]} onChange={set(k)} autoComplete={ac} inputMode={im === 'text' ? undefined : im} /></label>
        ))}
      </div>
      <button className="btn btn-primary w-full">{ok ? 'Tersimpan' : 'Simpan'}</button>
      <button type="button" onClick={clear} className="btn btn-ghost w-full">Kosongkan profil</button>
    </form>
  )
}

export function VoucherKu() {
  const claimed = useClaimed(), vs = useVouchers()
  const [copied, setCopied] = useState('')
  const copy = async (c) => { try { await navigator.clipboard.writeText(c); setCopied(c); setTimeout(() => setCopied(''), 1600); buzz() } catch (e) {} }
  if (!claimed.length) return <p className="glass rounded-3xl p-6 text-muted">Belum ada voucher yang diambil. Buka tab Voucher untuk mengambilnya.</p>
  return (
    <ul className="space-y-3">
      {claimed.map((c) => {
        const v = vs.find((x) => x.code === c)
        return (
          <li key={c} className="card">
            <p className="text-2xl font-extrabold tracking-widest text-accent">{c}</p>
            {v ? <p className="mt-1 text-sm"><span className="font-semibold">{v.title}</span>, potongan {voucherLabel(v)}</p> : <p className="mt-1 text-sm text-muted">Voucher ini sudah tidak berlaku atau kuotanya habis.</p>}
            <button type="button" onClick={() => copy(c)} className="btn btn-ghost mt-3 w-full">{copied === c ? 'Tersalin' : 'Salin kode'}</button>
          </li>
        )
      })}
    </ul>
  )
}

export function Faq() {
  return (
    <div>
      {faqs.map(([q, a]) => (
        <details key={q} className="glass mb-3 rounded-3xl px-6">
          <summary className="flex min-h-[56px] cursor-pointer items-center justify-between gap-4 py-4 font-semibold">{q}<Ico d="M12 5v14M5 12h14" size={18} className="plus shrink-0 transition-transform duration-200" /></summary>
          <p className="pb-5 leading-relaxed text-muted">{a}</p>
        </details>
      ))}
    </div>
  )
}

export function Cara() {
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => (
        <li key={s} className="card flex items-center gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink font-bold text-bg">{i + 1}</span>
          <span className="text-lg font-semibold">{s}</span>
        </li>
      ))}
    </ol>
  )
}

export function Lacak() {
  const mine = useMyOrders()
  const [pick, setPick] = useState('')
  return (
    <div className="space-y-4">
      {mine.length > 0 && (
        <section>
          <h2 className={cap}>Pesanan di perangkat ini</h2>
          <div className="flex flex-wrap gap-2">{mine.map((id) => <button key={id} type="button" onClick={() => setPick(id)} className="glass rounded-full px-4 py-2 text-sm font-semibold">{id}</button>)}</div>
        </section>
      )}
      <CekPesanan key={pick} initial={pick} compact allowAdmin />
    </div>
  )
}
