const KEY = 'sk-profile'
const EMPTY = { name: '', wa: '', email: '', city: '', age: '' }
const load = () => { try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch (e) { return { ...EMPTY } } }
let p = load()
export const getProfile = () => p
export function saveProfile(v) {
  p = { ...EMPTY, ...v }
  try { localStorage.setItem(KEY, JSON.stringify(p)) } catch (e) {}
}
