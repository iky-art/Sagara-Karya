import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'
export const rupiah = (n) => 'Rp' + Number(n).toLocaleString('id-ID')
const cut = (base, p) => Math.min(base, p.kind === 'persen' ? Math.floor((base * p.value) / 100) : p.value)
const live = (p, t = Date.now()) => p.active !== false && (!p.starts_at || new Date(p.starts_at) <= t) && (!p.ends_at || new Date(p.ends_at) > t)
export function priceFor(pkg, promos) {
  let best = { disc: 0, name: null }
  for (const p of promos) {
    if (!live(p) || (p.packages?.length && !p.packages.includes(pkg.name))) continue
    const d = cut(pkg.amount, p)
    if (d > best.disc) best = { disc: d, name: p.name }
  }
  return { base: pkg.amount, disc: best.disc, final: pkg.amount - best.disc, promo: best.name }
}
export function usePromos() {
  const [r, setR] = useState([])
  useEffect(() => { if (supabase) supabase.from('promos').select('*').then(({ data }) => data && setR(data)) }, [])
  return r
}
