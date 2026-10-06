import { useEffect, useState, useSyncExternalStore } from 'react'
import { supabase } from './supabase.js'
import { rupiah } from './pricing.js'
export const voucherLabel = (v) => (v.kind === 'persen' ? `${v.value}%` : rupiah(v.value))
export const voucherCut = (base, v) => Math.min(base, v.kind === 'persen' ? Math.floor((base * v.value) / 100) : v.value)
export const eligible = (v, pkgName, t = Date.now()) =>
  v.active !== false && (!v.starts_at || new Date(v.starts_at) <= t) && (!v.ends_at || new Date(v.ends_at) > t) &&
  (!v.quota || v.used < v.quota) && (!v.packages?.length || v.packages.includes(pkgName))
export function useVouchers() {
  const [r, setR] = useState([])
  useEffect(() => {
    if (!supabase) return
    const load = () => supabase.from('vouchers').select('*').order('created_at', { ascending: false }).then(({ data }) => data && setR(data))
    load()
    const t = setInterval(load, 60000)
    return () => clearInterval(t)
  }, [])
  return r
}
const KEY = 'sk-vouchers'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch (e) { return [] } }
let claimed = read()
const subs = new Set()
export const claim = (code) => {
  if (claimed.includes(code)) return
  claimed = [...claimed, code]
  try { localStorage.setItem(KEY, JSON.stringify(claimed)) } catch (e) {}
  subs.forEach((f) => f())
}
export const useClaimed = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, () => claimed)
