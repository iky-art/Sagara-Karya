import { useSyncExternalStore } from 'react'
const KEY = 'sk-orders'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch (e) { return [] } }
let list = read()
const subs = new Set()
export const addMyOrder = (id) => {
  if (list.includes(id)) return
  list = [id, ...list].slice(0, 20)
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch (e) {}
  subs.forEach((f) => f())
}
export const useMyOrders = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, () => list)
