import { contactHref } from '../data.js'
import { contactClick } from '../lib/contact.js'
import Logo from '../components/Logo.jsx'
const Arrow = () => (
  <span className="ml-3 grid h-7 w-7 place-items-center rounded-full bg-bg/15" aria-hidden="true">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  </span>
)
export default function Hero() {
  return (
    <section id="beranda" className="relative isolate overflow-hidden pb-16 pt-36 md:pb-24 md:pt-44">
      <div className="wrap text-center">
        <p className="mx-auto inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm font-medium text-ink/80">
          <span className="h-2 w-2 rounded-full bg-sun" aria-hidden="true" />Mulai dari Rp70.000
        </p>
        <h1 className="mx-auto mt-6 max-w-3xl text-[2.6rem] font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-6xl md:text-7xl">
          Situs yang rapi. Identitas yang <span className="grad-text">punya tempat.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
          <strong className="font-semibold text-ink">Sagara Karya</strong> membantu membuat website dan identitas digital yang sederhana, profesional, dan sesuai kebutuhanmu.
        </p>
        <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <a href="#layanan" className="btn btn-primary">Lihat Layanan<Arrow /></a>
          <a href={contactHref} onClick={contactClick} className="btn btn-ghost">Konsultasi</a>
        </div>
        <figure aria-hidden="true" className="glass mx-auto mt-14 max-w-3xl rounded-[28px] p-2 text-left md:mt-20">
          <div className="overflow-hidden rounded-[22px] border border-line bg-bg/80">
            <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
              <i className="h-2.5 w-2.5 rounded-full bg-line" /><i className="h-2.5 w-2.5 rounded-full bg-line" /><i className="h-2.5 w-2.5 rounded-full bg-line" />
              <span className="ml-3 h-5 w-40 rounded-md bg-surface" />
            </div>
            <div className="grid gap-6 p-6 sm:grid-cols-[1.2fr_1fr] sm:p-8">
              <div className="space-y-3">
                <span className="block h-3 w-16 rounded bg-sun/40" />
                <span className="block h-6 w-4/5 rounded bg-ink" />
                <span className="block h-6 w-3/5 rounded bg-ink" />
                <span className="block h-2.5 w-full rounded bg-line" />
                <span className="block h-2.5 w-5/6 rounded bg-line" />
                <div className="flex gap-2 pt-2"><span className="h-9 w-24 rounded-lg bg-ink" /><span className="h-9 w-20 rounded-lg border border-line" /></div>
              </div>
              <div className="rounded-xl bg-sand p-5">
                <Logo className="h-16 w-16" />
                <div className="mt-4 flex gap-2"><span className="h-8 w-8 rounded-full bg-ink" /><span className="h-8 w-8 rounded-full bg-sun" /><span className="h-8 w-8 rounded-full bg-line" /></div>
                <span className="mt-5 block h-2.5 w-3/4 rounded bg-ink/20" />
                <span className="mt-2 block h-2.5 w-1/2 rounded bg-ink/20" />
              </div>
            </div>
          </div>
        </figure>
      </div>
    </section>
  )
}
