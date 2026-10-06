import { useSyncExternalStore } from 'react'
let deferred = null
const subs = new Set()
export const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
const read = () => ({ can: !!deferred, ios: /iphone|ipad|ipod/i.test(navigator.userAgent), standalone: isStandalone() })
let snap = read()
const emit = () => { snap = read(); subs.forEach((f) => f()) }
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; emit() })
window.addEventListener('appinstalled', () => { deferred = null; emit() })
export async function install() {
  if (!deferred) return
  deferred.prompt()
  await deferred.userChoice
  deferred = null; emit()
}
export const useInstall = () => ({ ...useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, () => snap), install })
