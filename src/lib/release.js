import { useSyncExternalStore } from 'react'
import { supabase } from './supabase.js'
import { APP_VERSION } from './version.js'
const KEY = 'sk-applied'
const read = () => { try { return localStorage.getItem(KEY) } catch (e) { return null } }
let s = { list: [], applied: read() }
const subs = new Set()
const set = (p) => { s = { ...s, ...p }; subs.forEach((f) => f()) }
export const getState = () => s
const num = (v) => v.split('.').map(Number)
export const gt = (a, b) => { const x = num(a), y = num(b); for (let i = 0; i < 3; i++) { if (x[i] !== y[i]) return x[i] > y[i] } return false }
export const latestOf = (list) => list.reduce((m, r) => (!m || gt(r.version, m.version) ? r : m), null)
export function markApplied(v) { try { localStorage.setItem(KEY, v) } catch (e) {} set({ applied: v }) }
export async function loadReleases() {
  if (!supabase) return
  const { data } = await supabase.from('releases').select('*').order('created_at', { ascending: false }).limit(30)
  if (!data) return
  set({ list: data })
  const l = latestOf(data)
  if (l && !s.applied) markApplied(l.version)
}
export const pendingOf = (st) => { const l = latestOf(st.list); return l && st.applied && gt(l.version, st.applied) ? l : null }
export const displayVersion = (st) => st.applied || latestOf(st.list)?.version || APP_VERSION
export const useRelease = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, () => s)
export const useVersion = () => displayVersion(useRelease())
