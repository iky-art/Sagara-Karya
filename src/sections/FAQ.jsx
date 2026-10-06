import Reveal from '../components/Reveal.jsx'
import { faqs } from '../data.js'
export default function FAQ() {
  return (
    <section id="faq" className="section">
      <div className="wrap grid gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16">
        <Reveal as="h2" className="text-3xl font-semibold leading-tight md:text-5xl">Pertanyaan yang sering muncul</Reveal>
        <div>
          {faqs.map(([q, a]) => (
            <details key={q} className="glass mb-3 rounded-3xl px-6">
              <summary className="flex min-h-[56px] cursor-pointer items-center justify-between gap-4 py-4 text-lg font-medium">
                {q}
                <svg className="plus shrink-0 transition-transform duration-200" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              </summary>
              <p className="max-w-xl pb-6 leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
