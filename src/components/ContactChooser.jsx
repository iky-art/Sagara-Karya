import { useEffect, useRef, useState } from 'react'
import { channels } from '../data.js'
export default function ContactChooser() {
  const ref = useRef(null)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const on = () => setOpen(true)
    window.addEventListener('sk-contact', on)
    return () => window.removeEventListener('sk-contact', on)
  }, [])
  useEffect(() => {
    const d = ref.current
    if (open && d && !d.open) d.showModal()
  }, [open])
  if (!open) return null
  return (
    <dialog ref={ref} onClose={() => setOpen(false)} onClick={(e) => e.target === ref.current && ref.current.close()} aria-labelledby="contact-h" className="m-auto w-[calc(100%-1.5rem)] max-w-sm rounded-[28px] p-0 text-ink backdrop:bg-black/50">
      <div className="p-6">
        <h2 id="contact-h" className="text-2xl font-bold">Hubungi kami lewat</h2>
        <p className="mt-1 text-sm text-muted">Pilih yang paling nyaman untukmu.</p>
        <div className="mt-5 space-y-3">
          {channels.map((c, i) => (
            <a key={c.id} href={c.href} target={c.id === 'wa' ? '_blank' : undefined} rel="noreferrer" onClick={() => ref.current.close()} className={`btn w-full ${i === 0 ? 'btn-primary' : 'btn-ghost'}`}>{c.label}</a>
          ))}
        </div>
        <button type="button" onClick={() => ref.current.close()} className="mt-3 w-full py-2 text-sm font-medium text-muted hover:text-ink">Batal</button>
      </div>
    </dialog>
  )
}
