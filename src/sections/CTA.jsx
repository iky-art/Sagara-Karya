import Reveal from '../components/Reveal.jsx'
import { contactHref } from '../data.js'
import { contactClick } from '../lib/contact.js'
export default function CTA() {
  return (
    <section id="mulai" className="section">
      <Reveal className="wrap">
        <div className="rounded-[32px] bg-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_30px_60px_-30px_rgb(var(--ink)/0.7)] px-6 py-14 text-center text-bg md:px-12 md:py-20">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight md:text-5xl">Punya sesuatu yang ingin dibuat?</h2>
          <p className="mx-auto mt-5 max-w-md text-lg opacity-80">Mulai dari cerita dan kebutuhanmu. Sisanya, kita kerjakan bersama.</p>
          <a href={contactHref} onClick={contactClick} className="btn mt-8 bg-bg text-ink hover:opacity-90">Konsultasi Sekarang</a>
        </div>
      </Reveal>
    </section>
  )
}
