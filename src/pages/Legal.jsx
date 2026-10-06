import { useEffect } from 'react'
import Logo from '../components/Logo.jsx'
import Footer from '../components/Footer.jsx'
import { docs } from './legalContent.js'
export default function Legal({ slug }) {
  const d = docs[slug]
  useEffect(() => { document.title = `${d.title} — Sagara Karya` }, [d])
  return (
    <>
      <header className="border-b border-line">
        <div className="wrap flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 font-extrabold"><Logo className="h-9 w-9" /><span>Sagara <span className="grad-text">Karya</span></span></a>
          <a href="/" className="text-sm font-medium text-muted hover:text-ink">Kembali ke beranda</a>
        </div>
      </header>
      <main className="wrap py-14 md:py-20">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-extrabold md:text-5xl">{d.title}</h1>
          <p className="mt-3 text-sm text-muted">Terakhir diperbarui: {d.updated}</p>
          <div className="mt-10 space-y-10">
            {d.sections.map(([h, items]) => (
              <section key={h}>
                <h2 className="text-xl font-bold">{h}</h2>
                <div className="mt-3 space-y-3 leading-relaxed text-muted">
                  {items.map((it, i) => Array.isArray(it)
                    ? <ul key={i} className="list-disc space-y-1 pl-5">{it.map((x) => <li key={x}>{x}</li>)}</ul>
                    : <p key={i}>{it}</p>)}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
