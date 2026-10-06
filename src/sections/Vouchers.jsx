import { useState } from 'react'
import Reveal from '../components/Reveal.jsx'
import VoucherModal from '../components/VoucherModal.jsx'
import { useClaimed, useVouchers, voucherLabel } from '../lib/vouchers.js'
const day = (t) => new Date(t).toLocaleDateString('id-ID', { dateStyle: 'medium' })
export default function Vouchers() {
  const list = useVouchers(), claimed = useClaimed()
  const [sel, setSel] = useState(null)
  if (!list.length) return null
  return (
    <section id="voucher" className="pb-20 md:pb-28">
      <div className="wrap">
        <Reveal as="h2" className="max-w-xl text-3xl font-bold leading-tight md:text-5xl">Voucher untukmu</Reveal>
        <p className="mt-4 max-w-lg text-muted">Ketuk kartu untuk melihat isinya dan mengambil voucher. Tukarkan saat memesan.</p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((v) => (
            <li key={v.id}>
              <button type="button" onClick={() => setSel(v)} className="card block w-full text-left transition duration-200 hover:-translate-y-0.5">
                <span className="block text-4xl font-extrabold tracking-tight">{voucherLabel(v)}</span>
                <span className="mt-1 block text-sm font-semibold text-accent">{claimed.includes(v.code) ? 'Sudah diambil' : 'Ketuk untuk ambil'}</span>
                <span className="mt-4 block text-lg font-bold leading-snug">{v.title}</span>
                <span className="mt-1 block text-sm text-muted">{v.ends_at ? `Sampai ${day(v.ends_at)}` : 'Tanpa batas waktu'}{v.quota ? `, sisa ${v.quota - v.used}` : ''}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {sel && <VoucherModal v={sel} onClose={() => setSel(null)} />}
    </section>
  )
}
