import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
const inp = 'w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base text-ink focus:border-accent'
const day = (t) => new Date(t).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
export default function Broadcasts() {
  const [rows, setRows] = useState([]), [title, setTitle] = useState(''), [body, setBody] = useState(''), [msg, setMsg] = useState('')
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('broadcasts').select('*').order('created_at', { ascending: false })
    if (error) setMsg('Gagal memuat: ' + error.message); else setRows(data)
  }, [])
  useEffect(() => { load() }, [load])
  async function send(e) {
    e.preventDefault(); setMsg('')
    if (title.trim().length < 2 || !body.trim()) return setMsg('Isi judul dan pesan.')
    const { error } = await supabase.from('broadcasts').insert({ title: title.trim(), body: body.trim() })
    if (error) return setMsg('Gagal mengirim: ' + error.message)
    setTitle(''); setBody(''); load()
  }
  const toggle = async (b) => { const { error } = await supabase.from('broadcasts').update({ active: !b.active }).eq('id', b.id); error ? setMsg(error.message) : load() }
  const remove = async (b) => { if (!confirm('Hapus broadcast ini?')) return; const { error } = await supabase.from('broadcasts').delete().eq('id', b.id); error ? setMsg(error.message) : load() }
  return (
    <main className="wrap py-8">
      <h1 className="text-2xl font-bold">Broadcast</h1>
      <p className="mt-1 text-sm text-muted">Broadcast tampil otomatis di website sebagai notifikasi bergaya iPhone. Pengunjung melihatnya saat membuka atau menyegarkan halaman (dicek sekitar tiap 45 detik). Status dibaca disimpan di perangkat masing-masing pengunjung.</p>
      <form onSubmit={send} className="card mt-6 space-y-4">
        <input className={inp} maxLength={80} placeholder="Judul notifikasi" aria-label="Judul" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className={inp} rows={3} maxLength={300} placeholder="Isi pesan (maksimal 300 karakter)" aria-label="Isi pesan" value={body} onChange={(e) => setBody(e.target.value)} />
        {msg && <p role="alert" className="text-sm font-medium text-danger">{msg}</p>}
        <button className="btn btn-primary">Kirim broadcast</button>
      </form>
      <ul className="mt-6 space-y-3">
        {rows.length === 0 && <li className="text-muted">Belum ada broadcast.</li>}
        {rows.map((b) => (
          <li key={b.id} className="card flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-extrabold">{b.title} <span className="ml-1 rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-accent">{b.active ? 'Tampil' : 'Disembunyikan'}</span></p>
              <p className="mt-1 whitespace-pre-line text-sm text-muted">{b.body}</p>
              <p className="mt-1 text-xs text-muted">{day(b.created_at)}</p>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-ghost" onClick={() => toggle(b)}>{b.active ? 'Sembunyikan' : 'Tampilkan'}</button>
              <button className="btn btn-ghost text-danger" onClick={() => remove(b)}>Hapus</button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
