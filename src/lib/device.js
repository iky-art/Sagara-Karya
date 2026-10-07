import { getPrefs } from './prefs.js'
let lock = null
export const wakeSupported = () => 'wakeLock' in navigator
export async function setWake(on) {
  try {
    if (on && wakeSupported() && !lock && document.visibilityState === 'visible') {
      lock = await navigator.wakeLock.request('screen')
      lock.addEventListener('release', () => { lock = null })
    } else if (!on && lock) { await lock.release(); lock = null }
  } catch (e) {}
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && getPrefs().wake) setWake(true) })
export const enterFull = () => { try { document.documentElement.requestFullscreen?.({ navigationUI: 'hide' })?.catch(() => {}) } catch (e) {} }
export const exitFull = () => { try { if (document.fullscreenElement) document.exitFullscreen() } catch (e) {} }
export async function askNotify() {
  if (!('Notification' in window)) return 'unsupported'
  try { return await Notification.requestPermission() } catch (e) { return 'denied' }
}
export function beep() {
  try {
    const C = window.AudioContext || window.webkitAudioContext, c = new C(), o = c.createOscillator(), g = c.createGain()
    o.type = 'sine'; o.frequency.value = 880
    g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.15, c.currentTime + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.25)
    o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.26); setTimeout(() => c.close(), 400)
  } catch (e) {}
}
