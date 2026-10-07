import { useSyncExternalStore } from 'react'
const KEY = 'sk-prefs'
const DEF = { text: 'normal', glass: true, motion: true, splash: true, haptic: true, banner: true, fullscreen: true, wake: false, glow: 'normal', contrast: false, start: 'home', notify: false, accent: 'terracotta', font: 'default', blur: 'normal', splashMs: 3200, saver: false, autofill: true, bannerMs: 8000, poll: 45, autoUpdate: true, dnd: false, quiet: false, quietFrom: '22:00', quietTo: '06:00', sound: false, swipeBack: true, hapticLevel: 'normal', homeServices: true, homeVoucher: true, homeSocial: true, homeEmail: true }
const load = () => { try { return { ...DEF, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch (e) { return { ...DEF } } }
let p = load()
const subs = new Set()
const BLUR = { low: '10px', normal: '20px', high: '32px' }
const GLOW = { low: ['.14', '.09'], high: ['.6', '.4'] }
const SIZE = { small: '14px', normal: '', large: '18px' }
function apply() {
  const h = document.documentElement
  h.style.fontSize = SIZE[p.text] || ''
  h.dataset.glass = p.glass ? 'on' : 'off'
  h.dataset.motion = p.motion ? 'full' : 'reduce'
  h.dataset.accent = p.accent
  h.dataset.font = p.font
  h.style.setProperty('--blur', BLUR[p.blur] || '20px')
  h.dataset.contrast = p.contrast ? 'high' : 'normal'
  const g = GLOW[p.glow]
  if (g) { h.style.setProperty('--glow', g[0]); h.style.setProperty('--glow2', g[1]) } else { h.style.removeProperty('--glow'); h.style.removeProperty('--glow2') }
}
apply()
export const getPrefs = () => p
export function setPref(k, v) {
  p = { ...p, [k]: v }
  try { localStorage.setItem(KEY, JSON.stringify(p)) } catch (e) {}
  apply(); subs.forEach((f) => f())
}
export const usePrefs = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, () => p)
const VIB = { low: 6, normal: 10, high: 24 }
export const buzz = () => { if (p.haptic && navigator.vibrate) navigator.vibrate(VIB[p.hapticLevel] || 10) }
export function isQuiet() {
  if (p.dnd) return true
  if (!p.quiet) return false
  const t = (x) => { const [h, m] = x.split(':').map(Number); return h * 60 + m }
  const n = new Date(), m = n.getHours() * 60 + n.getMinutes(), a = t(p.quietFrom), b = t(p.quietTo)
  return a <= b ? m >= a && m < b : m >= a || m < b
}
