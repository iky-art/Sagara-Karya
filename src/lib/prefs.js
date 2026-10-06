import { useSyncExternalStore } from 'react'
const KEY = 'sk-prefs'
const DEF = { text: 'normal', glass: true, motion: true, splash: true, haptic: true, banner: true, fullscreen: true, wake: false, glow: 'normal', contrast: false, start: 'home', notify: false }
const load = () => { try { return { ...DEF, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch (e) { return { ...DEF } } }
let p = load()
const subs = new Set()
const GLOW = { low: ['.14', '.09'], high: ['.6', '.4'] }
const SIZE = { small: '14px', normal: '', large: '18px' }
function apply() {
  const h = document.documentElement
  h.style.fontSize = SIZE[p.text] || ''
  h.dataset.glass = p.glass ? 'on' : 'off'
  h.dataset.motion = p.motion ? 'full' : 'reduce'
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
export const buzz = () => { if (p.haptic && navigator.vibrate) navigator.vibrate(10) }
