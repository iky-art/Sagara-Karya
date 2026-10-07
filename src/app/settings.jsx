import { useState } from 'react'
import Logo from '../components/Logo.jsx'
import { Group, I, Ico, Item, Row, Seg } from './screens.jsx'
import { channels, socials } from '../data.js'
import { getMode, setMode } from '../lib/theme.js'
import { buzz, setPref, usePrefs } from '../lib/prefs.js'
import { getProfile } from '../lib/profile.js'
import { markAllRead, openCenter, unreadOf, useBroadcasts } from '../lib/broadcast.js'
import { install, useInstall } from '../lib/pwa.js'
import { askNotify, enterFull, exitFull, wakeSupported } from '../lib/device.js'
import { openContact } from '../lib/contact.js'
import { useClaimed } from '../lib/vouchers.js'
import { toast } from '../lib/toast.js'

const KEYS = ['sk-vouchers', 'sk-orders', 'sk-read', 'sk-prefs', 'sk-profile', 'sk-theme', 'sk-sub']
const P = (k) => (v) => { setPref(k, v); buzz() }
const wipeKeys = (ks, ask) => { if (!confirm(ask)) return; ks.forEach((k) => { try { localStorage.removeItem(k) } catch (e) {} }); location.reload() }

const CATS = [
  ['akun', 'Akun & pesanan', I.user, 'Profil, pesanan, voucher, email'],
  ['notif', 'Notifikasi', I.bell, 'Banner, notifikasi sistem, pengecekan'],
  ['tampilan', 'Tampilan', I.sparkle, 'Tema, warna, huruf, efek kaca'],
  ['layar', 'Layar & perangkat', I.fullscreen, 'Layar penuh, hemat data, getaran'],
  ['data', 'Privasi & data', I.shield, 'Cadangan, izin, hapus data'],
  ['bantuan', 'Bantuan', I.help, 'Panduan, kontak, lapor masalah'],
  ['tentang', 'Tentang', I.info, 'Versi, catatan rilis, kredit'],
]
const INDEX = [
  ['Profil saya', 'akun', 'nama nomor kota umur'], ['Lacak pesanan', 'akun', 'id status'], ['Voucher saya', 'akun', 'kode'], ['Kabar lewat email', 'akun', 'berlangganan newsletter'],
  ['Isi otomatis formulir', 'akun', 'autofill'], ['Instagram', 'akun', 'sosial media'], ['TikTok', 'akun', 'sosial media'],
  ['Pusat notifikasi', 'notif', ''], ['Banner notifikasi', 'notif', 'pemberitahuan'], ['Notifikasi sistem', 'notif', 'bilah'], ['Tandai semua dibaca', 'notif', ''],
  ['Lama banner tampil', 'notif', 'durasi'], ['Cek broadcast baru', 'notif', 'interval'],
  ['Tema', 'tampilan', 'terang gelap'], ['Ukuran teks', 'tampilan', 'font besar kecil'], ['Warna aksen', 'tampilan', 'biru hijau ungu'], ['Jenis huruf', 'tampilan', 'font serif sistem'],
  ['Intensitas warna latar', 'tampilan', 'glow'], ['Kekuatan blur', 'tampilan', 'kaca'], ['Durasi splash', 'tampilan', ''], ['Mode ringan', 'tampilan', 'hemat daya'],
  ['Efek kaca', 'tampilan', 'liquid glass'], ['Animasi', 'tampilan', 'gerakan'], ['Splash saat dibuka', 'tampilan', ''], ['Kontras tinggi', 'tampilan', 'aksesibilitas'], ['Kembalikan pengaturan tampilan', 'tampilan', 'reset'],
  ['Layar penuh', 'layar', 'fullscreen'], ['Jaga layar tetap menyala', 'layar', 'wake lock'], ['Hemat data', 'layar', 'kuota'], ['Getaran', 'layar', 'haptic'], ['Halaman awal', 'layar', 'tab'], ['Uji getaran', 'layar', ''],
  ['Cadangkan data', 'data', 'backup'], ['Pulihkan data', 'data', 'restore'], ['Penyimpanan', 'data', 'ukuran'], ['Hapus riwayat pesanan', 'data', ''], ['Hapus voucher diambil', 'data', ''], ['Hapus profil', 'data', ''],
  ['Hapus semua data', 'data', 'reset'], ['Izin notifikasi', 'data', ''], ['Perbarui aplikasi', 'data', 'update cache'],
  ['Pertanyaan umum', 'bantuan', 'faq'], ['Cara kerja', 'bantuan', ''], ['Tips penggunaan', 'bantuan', 'panduan'], ['Hubungi kami', 'bantuan', 'whatsapp gmail'], ['Lapor masalah', 'bantuan', 'bug'], ['Bagikan aplikasi', 'bantuan', 'share'],
  ['Info aplikasi', 'tentang', 'versi'], ['Catatan rilis', 'tentang', 'changelog'], ['Kredit', 'tentang', 'lisensi'], ['Syarat & Ketentuan', 'tentang', 'legal'], ['Kebijakan Privasi', 'tentang', 'legal'], ['Pasang aplikasi', 'tentang', 'install'],
]

export function Setelan({ openSub }) {
  const [q, setQ] = useState('')
  const unread = unreadOf(useBroadcasts()).length
  const name = getProfile().name
  const term = q.trim().toLowerCase()
  const hits = term ? INDEX.filter(([l, , k]) => `${l} ${k}`.toLowerCase().includes(term)) : []
  const catName = Object.fromEntries(CATS.map((c) => [c[0], c[1]]))
  return (
    <div className="space-y-5">
      <button type="button" onClick={() => openSub('profil')} className="glass flex w-full items-center gap-4 rounded-3xl p-5 text-left">
        <Logo className="h-14 w-14" />
        <span className="min-w-0 flex-1"><span className="block text-lg font-bold">{name || 'Atur profilmu'}</span><span className="block text-sm text-muted">{name ? 'Profil tersimpan di perangkat ini' : 'Isi data agar pemesanan lebih cepat'}</span></span>
        <Ico d={I.chev} size={18} className="text-muted" />
      </button>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"><Ico d={I.search} size={20} /></span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari pengaturan" aria-label="Cari pengaturan" className="min-h-[52px] w-full rounded-full border border-line bg-bg pl-12 pr-5 text-base focus:border-accent" />
      </div>
      {term ? (
        hits.length ? <Group title={`${hits.length} hasil`}>{hits.map(([l, c]) => <Row key={l} icon={I.search} label={l} hint={catName[c]} onClick={() => openSub('set-' + c)} />)}</Group>
          : <p className="glass rounded-3xl p-6 text-muted">Tidak ada pengaturan yang cocok dengan "{q}".</p>
      ) : (
        <>
          <Group title="Pengaturan">
            {CATS.map(([k, l, ic, h]) => <Row key={k} icon={ic} label={l} hint={k === 'notif' && unread ? `${unread} belum dibaca` : h} onClick={() => openSub('set-' + k)}
              right={k === 'notif' && unread ? <span className="grid h-6 min-w-[24px] place-items-center rounded-full bg-accent px-1.5 text-xs font-bold text-onaccent">{unread}</span> : undefined} />)}
          </Group>
          <p className="px-2 text-center text-sm text-muted">Sagara Karya versi 1.0.0</p>
        </>
      )}
    </div>
  )
}

export function SetAkun({ openSub }) {
  const pr = usePrefs(), claimed = useClaimed()
  return (
    <div className="space-y-6">
      <Group title="Akun">
        <Row icon={I.user} label="Profil saya" hint={getProfile().name || 'Isi data agar pemesanan lebih cepat'} onClick={() => openSub('profil')} />
        <Row icon={I.search} label="Lacak pesanan" hint="Cek status dengan ID pesanan" onClick={() => openSub('lacak')} />
        <Row icon={I.ticket} label="Voucher saya" hint={claimed.length ? `${claimed.length} voucher diambil` : 'Belum ada yang diambil'} onClick={() => openSub('voucherku')} />
        <Row icon={I.mail} label="Kabar lewat email" hint="Berlangganan pengumuman dan promo" onClick={() => openSub('langganan')} />
      </Group>
      <Group title="Formulir pemesanan">
        <Item icon={I.user} label="Isi otomatis dari profil" hint="Nama, kontak, kota, dan umur terisi saat memesan" on={pr.autofill} onChange={P('autofill')} />
      </Group>
      <Group title="Ikuti kami">{socials.map((s) => <Row key={s.id} icon={I[s.id]} label={s.label} hint={s.handle} href={s.href} />)}</Group>
    </div>
  )
}

export function SetNotif() {
  const pr = usePrefs(), unread = unreadOf(useBroadcasts()).length
  const setNotify = async (v) => {
    if (!v) return setPref('notify', false)
    const r = await askNotify()
    if (r === 'granted') { setPref('notify', true); toast('Notifikasi sistem aktif') } else toast('Izin notifikasi tidak diberikan')
  }
  return (
    <div className="space-y-6">
      <Group title="Notifikasi">
        <Row icon={I.bell} label="Pusat notifikasi" hint={unread > 0 ? `${unread} belum dibaca` : 'Tidak ada yang baru'} onClick={openCenter} />
        <Item icon={I.bell} label="Banner notifikasi" hint="Tampilkan pemberitahuan di bagian atas layar" on={pr.banner} onChange={P('banner')} />
        <Item icon={I.bolt} label="Notifikasi sistem" hint="Muncul di bilah notifikasi HP selama aplikasi masih berjalan di latar" on={pr.notify} onChange={setNotify} />
        <Row icon={I.check} label="Tandai semua dibaca" right={<span />} onClick={() => { markAllRead(); toast('Semua ditandai dibaca') }} />
      </Group>
      <div className="space-y-4">
        <Seg caption="Lama banner tampil" value={pr.bannerMs} onChange={P('bannerMs')} options={[[4000, '4 detik'], [8000, '8 detik'], [15000, '15 detik']]} />
        <Seg caption="Cek broadcast baru tiap" value={pr.poll} onChange={P('poll')} options={[[30, '30 detik'], [45, '45 detik'], [90, '90 detik']]} />
      </div>
      <p className="px-2 text-sm text-muted">Notifikasi sistem hanya muncul selama aplikasi masih berjalan di latar. Mode Hemat data menghentikan pengecekan otomatis.</p>
    </div>
  )
}

export function SetTampilan() {
  const [mode, setM] = useState(getMode)
  const pr = usePrefs()
  const light = !pr.glass && !pr.motion && !pr.splash
  const setLight = (v) => { ['glass', 'motion', 'splash'].forEach((k) => setPref(k, !v)); buzz() }
  return (
    <div className="space-y-5">
      <Seg caption="Tema" value={mode} onChange={(m) => { buzz(); setMode(m); setM(m) }} options={[['light', 'Terang'], ['dark', 'Gelap'], ['system', 'Sistem']]} />
      <Seg caption="Warna aksen" value={pr.accent} onChange={P('accent')} options={[['terracotta', 'Terracotta'], ['biru', 'Biru'], ['hijau', 'Hijau'], ['ungu', 'Ungu']]} />
      <Seg caption="Ukuran teks" value={pr.text} onChange={P('text')} options={[['small', 'Kecil'], ['normal', 'Normal'], ['large', 'Besar']]} />
      <Seg caption="Jenis huruf" value={pr.font} onChange={P('font')} options={[['default', 'Bawaan'], ['system', 'Sistem'], ['serif', 'Serif']]} />
      <Seg caption="Intensitas warna latar" value={pr.glow} onChange={P('glow')} options={[['low', 'Rendah'], ['normal', 'Sedang'], ['high', 'Tinggi']]} />
      <Seg caption="Kekuatan blur kaca" value={pr.blur} onChange={P('blur')} options={[['low', 'Rendah'], ['normal', 'Sedang'], ['high', 'Tinggi']]} />
      <Seg caption="Durasi splash" value={pr.splashMs} onChange={P('splashMs')} options={[[1500, 'Singkat'], [3200, 'Normal'], [5000, 'Panjang']]} />
      <Group title="Efek dan aksesibilitas">
        <Item icon={I.bolt} label="Mode ringan" hint="Matikan efek kaca, animasi, dan splash sekaligus" on={light} onChange={setLight} />
        <Item icon={I.sparkle} label="Efek kaca" hint="Matikan jika aplikasi terasa berat" on={pr.glass} onChange={P('glass')} />
        <Item icon={I.play} label="Animasi" hint="Matikan untuk mengurangi gerakan" on={pr.motion} onChange={P('motion')} />
        <Item icon={I.home} label="Splash saat dibuka" on={pr.splash} onChange={P('splash')} />
        <Item icon={I.contrast} label="Kontras tinggi" hint="Teks dan garis lebih tegas" on={pr.contrast} onChange={P('contrast')} />
        <Row icon={I.refresh} label="Kembalikan pengaturan tampilan" right={<span />} onClick={() => wipeKeys(['sk-prefs'], 'Kembalikan semua pengaturan tampilan ke bawaan?')} />
      </Group>
    </div>
  )
}

export function SetLayar() {
  const pr = usePrefs()
  const setFull = (v) => { setPref('fullscreen', v); v ? enterFull() : exitFull() }
  return (
    <div className="space-y-6">
      <Group title="Layar">
        <Item icon={I.fullscreen} label="Layar penuh" hint="Sembunyikan bilah sistem, aktif saat layar disentuh pertama kali" on={pr.fullscreen} onChange={setFull} />
        <Item icon={I.sun} label="Jaga layar tetap menyala" hint={wakeSupported() ? 'Layar tidak padam saat aplikasi dibuka' : 'Tidak didukung di perangkat ini'} on={pr.wake} onChange={P('wake')} />
      </Group>
      <Group title="Perangkat">
        <Item icon={I.dl} label="Hemat data" hint="Hentikan pengecekan otomatis voucher dan broadcast" on={pr.saver} onChange={P('saver')} />
        <Item icon={I.vibrate} label="Getaran" hint="Getar singkat saat menekan tombol" on={pr.haptic} onChange={P('haptic')} />
        <Row icon={I.vibrate} label="Uji getaran" hint={navigator.vibrate ? 'Getar sekali' : 'Tidak didukung di perangkat ini'} right={<span />} onClick={() => { navigator.vibrate?.(60); toast(navigator.vibrate ? 'Getar diuji' : 'Getaran tidak didukung') }} />
      </Group>
      <Seg caption="Halaman saat aplikasi dibuka" value={pr.start} onChange={P('start')} options={[['home', 'Beranda'], ['paket', 'Paket'], ['voucher', 'Voucher']]} />
    </div>
  )
}

export function SetData() {
  const [perm, setPerm] = useState('Notification' in window ? Notification.permission : 'tidak didukung')
  let bytes = 0
  try { KEYS.forEach((k) => { bytes += (localStorage.getItem(k) || '').length }) } catch (e) {}
  const backup = async () => {
    const o = {}
    KEYS.forEach((k) => { try { const v = localStorage.getItem(k); if (v != null) o[k] = v } catch (e) {} })
    try { await navigator.clipboard.writeText(JSON.stringify(o)); toast('Cadangan disalin ke papan klip') } catch (e) { toast('Gagal menyalin cadangan') }
  }
  const restore = () => {
    const t = prompt('Tempel cadangan data yang sudah disalin:')
    if (!t) return
    try {
      const o = JSON.parse(t), ok = KEYS.filter((k) => typeof o[k] === 'string')
      if (!ok.length) throw new Error('kosong')
      ok.forEach((k) => localStorage.setItem(k, o[k]))
      location.reload()
    } catch (e) { toast('Cadangan tidak valid') }
  }
  const refresh = async () => {
    toast('Memeriksa pembaruan...')
    try { const reg = await navigator.serviceWorker?.getRegistration(); await reg?.update(); const ks = await caches.keys(); await Promise.all(ks.map((k) => caches.delete(k))) } catch (e) {}
    location.reload()
  }
  return (
    <div className="space-y-6">
      <Group title="Data">
        <Row icon={I.save} label="Cadangkan data" hint="Salin voucher, pesanan, profil, dan pengaturan" right={<span />} onClick={backup} />
        <Row icon={I.dl} label="Pulihkan data" hint="Tempel cadangan dari perangkat lain" right={<span />} onClick={restore} />
        <Row icon={I.info} label="Penyimpanan" hint={`Data aplikasi di perangkat: ${(bytes / 1024).toFixed(1)} KB`} right={<span />} />
      </Group>
      <Group title="Izin">
        <Row icon={I.bell} label="Izin notifikasi" hint={perm === 'granted' ? 'Diizinkan' : perm === 'denied' ? 'Ditolak, ubah di pengaturan browser' : perm === 'default' ? 'Belum diminta, ketuk untuk meminta' : perm} right={<span />}
          onClick={async () => { if (perm === 'default') setPerm(await askNotify()) }} />
      </Group>
      <Group title="Hapus data">
        <Row icon={I.trash} label="Hapus riwayat pesanan" hint="ID pesanan yang tersimpan di perangkat" right={<span />} onClick={() => wipeKeys(['sk-orders'], 'Hapus ID pesanan yang tersimpan di perangkat ini?')} />
        <Row icon={I.trash} label="Hapus voucher diambil" hint="Voucher di daftar Voucher saya" right={<span />} onClick={() => wipeKeys(['sk-vouchers'], 'Hapus voucher yang sudah diambil di perangkat ini?')} />
        <Row icon={I.trash} label="Hapus profil" hint="Nama, kontak, kota, dan umur" right={<span />} onClick={() => wipeKeys(['sk-profile'], 'Hapus profil yang tersimpan di perangkat ini?')} />
        <Row icon={I.trash} label="Hapus semua data" hint="Termasuk pengaturan" danger right={<span />} onClick={() => wipeKeys([...KEYS, 'sk-install-dismissed'], 'Hapus semua data dan pengaturan di perangkat ini?')} />
      </Group>
      <Group title="Pembaruan">
        <Row icon={I.refresh} label="Perbarui aplikasi" hint="Kosongkan cache dan muat versi terbaru" right={<span />} onClick={refresh} />
      </Group>
    </div>
  )
}

export function SetBantuan({ openSub }) {
  const dm = ['fullscreen', 'standalone', 'minimal-ui', 'browser'].find((m) => window.matchMedia(`(display-mode: ${m})`).matches) || 'browser'
  const share = async () => {
    const data = { title: 'Sagara Karya', text: 'Studio digital untuk website dan identitas digital.', url: location.origin }
    try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(data.url); toast('Tautan disalin') } } catch (e) {}
  }
  const report = async () => {
    const text = `Laporan masalah Sagara Karya\nVersi: 1.0.0\nMode: ${dm}\nPerangkat: ${navigator.userAgent}\nOnline: ${navigator.onLine}\n\nJelaskan masalahnya:\n`
    const wa = channels.find((c) => c.id === 'wa'), mail = channels.find((c) => c.id === 'mail')
    if (wa) window.open(`${wa.href.split('?')[0]}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
    else if (mail) location.href = `${mail.href.split('?')[0]}?subject=${encodeURIComponent('Laporan masalah Sagara Karya')}&body=${encodeURIComponent(text)}`
    else { try { await navigator.clipboard.writeText(text); toast('Detail laporan disalin') } catch (e) { toast('Gagal menyalin') } }
  }
  return (
    <div className="space-y-6">
      <Group title="Panduan">
        <Row icon={I.help} label="Pertanyaan umum" onClick={() => openSub('faq')} />
        <Row icon={I.steps} label="Cara kerja" hint="Dari cerita sampai website siap" onClick={() => openSub('cara')} />
        <Row icon={I.sparkle} label="Tips penggunaan" hint="Fitur yang sering terlewat" onClick={() => openSub('tips')} />
      </Group>
      <Group title="Hubungi kami">
        {channels.length === 1 ? <Row icon={I.chat} label="Hubungi kami" hint={channels[0].label} href={channels[0].href} /> : channels.length > 1 ? <Row icon={I.chat} label="Hubungi kami" hint="WhatsApp atau Gmail" onClick={openContact} /> : <Row icon={I.chat} label="Hubungi kami" hint="Lewat Mulai Konsultasi saat memesan paket" right={<span />} />}
        <Row icon={I.info} label="Lapor masalah" hint="Kirim detail perangkat bersama laporanmu" right={<span />} onClick={report} />
        <Row icon={I.share} label="Bagikan aplikasi" right={<span />} onClick={share} />
      </Group>
      <Group title="Lainnya"><Row icon={I.globe} label="Lihat versi website" href="/?web=1" /></Group>
    </div>
  )
}

export function SetTentang({ openSub }) {
  const ins = useInstall()
  return (
    <div className="space-y-6">
      <section className="glass flex items-center gap-4 rounded-3xl p-5">
        <Logo className="h-14 w-14" />
        <div><p className="text-lg font-bold">Sagara <span className="grad-text">Karya</span></p><p className="text-sm text-muted">Studio digital untuk website dan identitas digital. Versi 1.0.0</p></div>
      </section>
      <Group title="Aplikasi">
        <Row icon={I.info} label="Info aplikasi" hint="Mode tampil, penyimpanan, status" onClick={() => openSub('info')} />
        <Row icon={I.doc} label="Catatan rilis" onClick={() => openSub('rilis')} />
        <Row icon={I.heart} label="Kredit" hint="Teknologi yang dipakai" onClick={() => openSub('kredit')} />
        {!ins.standalone && (ins.can || ins.ios) && <Row icon={I.dl} label="Pasang aplikasi" hint={ins.can ? 'Tambahkan ke layar utama' : 'Ketuk Bagikan di Safari, lalu Tambah ke Layar Utama'} onClick={ins.can ? install : undefined} right={ins.can ? undefined : <span />} />}
      </Group>
      <Group title="Legal">
        <Row icon={I.doc} label="Syarat & Ketentuan" href="/syarat-ketentuan" />
        <Row icon={I.shield} label="Kebijakan Privasi" href="/kebijakan-privasi" />
      </Group>
    </div>
  )
}

const list = (items) => <ul className="glass divide-y divide-line overflow-hidden rounded-3xl">{items.map((t) => <li key={t} className="p-4 leading-relaxed">{t}</li>)}</ul>
export const Tips = () => list([
  'Ketuk kartu voucher untuk melihat isinya, lalu ketuk Ambil Voucher.',
  'Isi Profil saya agar form pemesanan terisi otomatis.',
  'Simpan ID pesananmu. ID itu dipakai di Lacak pesanan, dan pesanan dari perangkat ini tersimpan otomatis.',
  'Jika aplikasi terasa berat, aktifkan Mode ringan di Tampilan.',
  'Cadangkan data sebelum ganti HP, lalu pulihkan di perangkat baru.',
  'Layar penuh aktif setelah sentuhan pertama dan bisa dimatikan di Layar & perangkat.',
])
export const Rilis = () => list([
  'Versi 1.0.0: pemesanan paket dengan promo dan voucher, cek pesanan dengan ID, dan pusat notifikasi dari broadcast.',
  'Tampilan aplikasi khusus (PWA) dengan gaya Liquid Glass, mode terang dan gelap, serta layar penuh.',
  'Setelan lengkap: profil, tampilan, layar, privasi dan data, serta bantuan.',
  'Langganan email tahap 1: pendaftaran alamat email. Pengiriman otomatis menyusul.',
])
export const Kredit = () => list([
  'Huruf Plus Jakarta Sans (SIL Open Font License) lewat Google Fonts.',
  'React dan Vite untuk antarmuka dan proses build.',
  'Tailwind CSS untuk gaya tampilan.',
  'Supabase untuk basis data dan login admin.',
  'Dihosting di Cloudflare Pages.',
])
