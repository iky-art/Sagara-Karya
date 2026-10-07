import { getPrefs } from './prefs.js'
import { BUILD_ID } from './version.js'
import { getState, loadReleases, markApplied, pendingOf } from './release.js'
let started = false
export async function checkUpdate() {
  let build = null
  if (BUILD_ID !== 'dev') {
    try {
      const r = await fetch('/version.json?t=' + Date.now(), { cache: 'no-store' })
      if (r.ok) { const j = await r.json(); if (j.build && j.build !== BUILD_ID) build = j }
    } catch (e) {}
  }
  await loadReleases()
  if (build) navigator.serviceWorker?.getRegistration().then((g) => g?.update())
  return pendingOf(getState()) ? 'new' : build ? 'build' : 'latest'
}
export async function applyUpdate() {
  try {
    const ks = await caches.keys(); await Promise.all(ks.map((k) => caches.delete(k)))
    const reg = await navigator.serviceWorker?.getRegistration(); await reg?.update()
  } catch (e) {}
  location.reload()
}
export async function applyRelease() {
  const p = pendingOf(getState())
  if (p) { markApplied(p.version); try { sessionStorage.setItem('sk-updated', p.version) } catch (e) {} }
  await applyUpdate()
}
const idle = () => !document.querySelector('dialog[open]')
async function tick() {
  const r = await checkUpdate()
  const p = pendingOf(getState())
  if (!idle()) return
  if (p?.wajib) return applyRelease()
  if (getPrefs().autoUpdate) { if (p) return applyRelease(); if (r === 'build') return applyUpdate() }
}
export function startUpdates() {
  if (started) return
  started = true
  setTimeout(checkUpdate, 3000)
  setInterval(() => { if (document.visibilityState === 'visible') checkUpdate().then(() => { const p = pendingOf(getState()); if (p?.wajib && idle()) applyRelease() }) }, 5 * 60 * 1000)
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') tick() })
}
