import { nav, socials } from '../data.js'
import SocialIcon from './SocialIcon.jsx'
import Logo from './Logo.jsx'
import { install, useInstall } from '../lib/pwa.js'
export default function Footer() {
  const base = location.pathname === '/' ? '' : '/'
  const ins = useInstall()
  return (
    <footer className="border-t border-line py-12">
      <div className="wrap flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="flex items-center gap-2.5 text-xl font-extrabold"><Logo className="h-9 w-9" /><span>Sagara <span className="grad-text">Karya</span></span></p>
          <p className="mt-2 max-w-xs text-muted">Studio digital untuk website dan identitas digital.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {nav.map(([l, h]) => <a key={h} href={base + h} className="text-muted hover:text-ink">{l}</a>)}
        </nav>
      </div>
      <div className="wrap mt-8">
        <p className="text-sm font-semibold">Ikuti akun resmi kami</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {socials.map((s) => (
            <a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`${s.label} ${s.handle}`} className="glass inline-flex items-center gap-2.5 rounded-full py-2.5 pl-3.5 pr-4 text-sm font-semibold"><SocialIcon id={s.id} />{s.handle}</a>
          ))}
        </div>
      </div>
      <div className="wrap mt-10 flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Sagara Karya. All rights reserved.</p>
        <p className="flex flex-wrap gap-x-5 gap-y-2"><a href="/syarat-ketentuan" className="hover:text-ink">Syarat &amp; Ketentuan</a><a href="/kebijakan-privasi" className="hover:text-ink">Kebijakan Privasi</a>{!ins.standalone && (ins.can || ins.ios) && <button type="button" onClick={() => (ins.can ? install() : alert('Ketuk tombol Bagikan di Safari, lalu pilih Tambah ke Layar Utama.'))} className="font-semibold text-accent hover:underline">Pasang aplikasi</button>}</p>
      </div>
    </footer>
  )
}
