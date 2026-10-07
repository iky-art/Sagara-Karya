import { useSyncExternalStore } from 'react'
import { supabase } from './supabase.js'
import { getPrefs } from './prefs.js'
const KEY = 'sk-read'
const loadRead = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch (e) { return [] } }
let s = { items: [], read: loadRead(), banner: null, sheet: null }
const subs = new Set()
const set = (p) => { s = { ...s, ...p }; subs.forEach((f) => f()) }
const seen = new Set()
const notified = new Set()
async function pushLocal(i) {
  try {
    const reg = await navigator.serviceWorker?.ready
    await reg?.showNotification(i.title, { body: i.body, icon: '/icon-192.png', badge: '/icon-192.png', tag: i.id })
  } catch (e) {}
}
let timer, started = false
export const unreadOf = (st) => st.items.filter((i) => !st.read.includes(i.id))
function showBanner(item) {
  if (!getPrefs().banner) return
  seen.add(item.id); clearTimeout(timer)
  set({ banner: item }); timer = setTimeout(() => set({ banner: null }), getPrefs().bannerMs)
}
async function load() {
  const { data } = await supabase.from('broadcasts').select('*').order('created_at', { ascending: false }).limit(20)
  if (!data) return
  set({ items: data })
  for (const i of unreadOf(s)) {
    if (notified.has(i.id)) continue
    notified.add(i.id)
    if (document.visibilityState === 'hidden' && getPrefs().notify && 'Notification' in window && Notification.permission === 'granted') pushLocal(i)
  }
  const next = unreadOf(s).find((i) => !seen.has(i.id))
  if (next && !s.sheet) showBanner(next)
}
function schedule() {
  setTimeout(async () => {
    if (!getPrefs().saver && (document.visibilityState === 'visible' || getPrefs().notify)) await load()
    schedule()
  }, getPrefs().poll * 1000)
}
export function startBroadcasts() {
  if (started || !supabase) return
  started = true
  setTimeout(load, 1200)
  schedule()
}
export function openCenter() {
  clearTimeout(timer)
  const unread = unreadOf(s), earlier = s.items.filter((i) => s.read.includes(i.id)).slice(0, 10)
  const read = [...new Set([...s.read, ...s.items.map((i) => i.id)])].slice(-100)
  try { localStorage.setItem(KEY, JSON.stringify(read)) } catch (e) {}
  set({ banner: null, read, sheet: { unread, earlier } })
}
export const closeCenter = () => set({ sheet: null })
export const useBroadcasts = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, () => s)
export function markAllRead() {
  const read = [...new Set([...s.read, ...s.items.map((i) => i.id)])].slice(-100)
  try { localStorage.setItem(KEY, JSON.stringify(read)) } catch (e) {}
  set({ read })
}
