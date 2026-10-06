const KEY = 'sk-theme'
const sys = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
export const getMode = () => { try { const v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : 'system' } catch (e) { return 'system' } }
export function setMode(m) {
  try { m === 'system' ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, m) } catch (e) {}
  document.documentElement.dataset.theme = m === 'system' ? sys() : m
}
