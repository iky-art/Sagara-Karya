import Reveal from '../components/Reveal.jsx'
import { services } from '../data.js'
const icons = [
  'M3 5h18v14H3zM3 9h18',
  'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  'M6 3h9l4 4v14H6zM9 12h7M9 16h7',
  'M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z',
  'M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M8 15v4',
]
export default function Services() {
  return (
    <section id="layanan" className="section">
      <div className="wrap">
        <Reveal as="h2" className="max-w-xl text-3xl font-bold leading-tight md:text-5xl">Apa yang bisa kami kerjakan</Reveal>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:mt-16">
          {services.map(([t, d], i) => (
            <Reveal as="li" key={t} className="card">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-sand text-accent">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icons[i]} /></svg>
              </span>
              <h3 className="mt-5 text-xl font-bold">{t}</h3>
              <p className="mt-2 text-muted">{d}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
