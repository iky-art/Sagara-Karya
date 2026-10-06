import Reveal from '../components/Reveal.jsx'
import { why } from '../data.js'
export default function Why() {
  return (
    <section className="section" aria-labelledby="why-h">
      <div className="wrap">
        <Reveal as="h2" id="why-h" className="max-w-xl text-3xl font-bold leading-tight md:text-5xl">Kenapa Sagara Karya</Reveal>
        <dl className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 md:mt-16">
          {why.map(([t, d]) => (
            <Reveal key={t}>
              <svg className="text-accent" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" /></svg>
              <dt className="mt-4 text-xl font-bold">{t}</dt>
              <dd className="mt-2 text-muted">{d}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  )
}
