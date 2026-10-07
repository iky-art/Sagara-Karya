import { useState } from 'react'
import { applyRelease } from '../lib/update.js'
import { pendingOf, useRelease } from '../lib/release.js'
export default function UpdatePrompt() {
  const p = pendingOf(useRelease())
  const [hide, setHide] = useState('')
  if (!p || hide === p.version) return null
  return (
    <div role="alert" className="solid fixed inset-x-4 z-50 mx-auto max-w-sm rounded-3xl p-4 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)]">
      <p className="font-bold">Versi {p.version} tersedia</p>
      {p.title && <p className="mt-0.5 text-sm font-medium">{p.title}</p>}
      {p.notes.length > 0 && <ul className="mt-1 list-disc pl-5 text-sm text-muted">{p.notes.slice(0, 3).map((n) => <li key={n}>{n}</li>)}</ul>}
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={applyRelease} className="btn btn-primary flex-1 !min-h-[44px]">Perbarui</button>
        <button type="button" onClick={() => setHide(p.version)} className="btn btn-ghost flex-1 !min-h-[44px]">Nanti</button>
      </div>
    </div>
  )
}
