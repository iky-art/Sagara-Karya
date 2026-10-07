import { useEffect, useState } from 'react'
export default function Toaster() {
  const [msg, setMsg] = useState('')
  useEffect(() => {
    let t
    const on = (e) => { setMsg(e.detail); clearTimeout(t); t = setTimeout(() => setMsg(''), 2400) }
    window.addEventListener('sk-toast', on)
    return () => { window.removeEventListener('sk-toast', on); clearTimeout(t) }
  }, [])
  if (!msg) return null
  return <p role="status" className="solid fixed left-1/2 z-50 w-fit max-w-[90vw] -translate-x-1/2 rounded-full px-4 py-2 text-center text-sm font-medium bottom-[calc(env(safe-area-inset-bottom)+5.5rem)]">{msg}</p>
}
