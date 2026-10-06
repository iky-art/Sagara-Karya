import Reveal from '../components/Reveal.jsx'
import { steps } from '../data.js'
export default function Process() {
  return (
    <section className="section" aria-labelledby="proses-h">
      <div className="wrap">
        <Reveal as="h2" id="proses-h" className="max-w-xl text-3xl font-bold leading-tight md:text-5xl">Dari cerita sampai jadi</Reveal>
        <ol className="mt-12 grid gap-6 md:mt-16 md:grid-cols-5 md:gap-4">
          {steps.map((s, i) => (
            <Reveal as="li" key={s} className="flex items-center gap-4 md:block">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent font-bold text-onaccent">{i + 1}</span>
              <p className="text-lg font-semibold leading-snug md:mt-4">{s}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
