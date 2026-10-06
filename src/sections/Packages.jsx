import { useState } from 'react'
import OrderModal from '../components/OrderModal.jsx'
import Reveal from '../components/Reveal.jsx'
import { packages } from '../data.js'
import { priceFor, rupiah, usePromos } from '../lib/pricing.js'
export default function Packages() {
  const [sel, setSel] = useState(null)
  const promos = usePromos()
  return (
    <section id="paket" className="section">
      <div className="wrap">
        <Reveal as="h2" className="max-w-xl text-3xl font-bold leading-tight md:text-5xl">Paket dan harga</Reveal>
        <p className="mt-4 max-w-lg text-muted">Pilih yang paling dekat dengan kebutuhanmu. Detail yang belum tercantum kita bahas saat konsultasi.</p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:mt-14">
          {packages.map((p) => {
            const pr = priceFor(p, promos)
            return (
              <Reveal key={p.name} className="card flex flex-col">
                <h3 className="text-lg font-bold">{p.name}</h3>
                {pr.disc > 0 && <p className="mt-3 text-sm"><s className="text-muted">{p.price}</s> <span className="font-semibold text-accent">Hemat {rupiah(pr.disc)}</span></p>}
                <p className={`${pr.disc > 0 ? 'mt-1' : 'mt-3'} text-3xl font-extrabold tracking-tight`}>{pr.disc > 0 ? (p.name === 'Custom' ? 'Mulai ' : '') + rupiah(pr.final) : p.price}</p>
                {pr.promo && <p className="mt-2 w-fit rounded-full bg-sand px-3 py-1 text-xs font-semibold text-accent">Promo: {pr.promo}</p>}
                <p className="mt-4 rounded-lg bg-sand px-3 py-2 text-sm font-medium text-accent">{p.stack}</p>
                <p className="mt-4 flex-1 text-muted">{p.desc}</p>
                <button type="button" onClick={() => setSel({ ...p, pr })} className="btn btn-primary mt-6" aria-label={`Pilih Paket ${p.name}`}>Pilih Paket</button>
              </Reveal>
            )
          })}
        </div>
        <p className="mt-6 text-sm text-muted">Fitur di luar yang tertulis di atas, termasuk domain dan hosting, tidak otomatis termasuk dan dibicarakan saat konsultasi.</p>
      </div>
      {sel && <OrderModal pkg={sel} onClose={() => setSel(null)} />}
    </section>
  )
}
