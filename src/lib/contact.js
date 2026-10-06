import { channels } from '../data.js'
// Jika ada 2 kanal (WhatsApp dan Gmail), tampilkan pilihan; jika hanya 1, tautan langsung dipakai.
export function contactClick(e) {
  if (channels.length > 1) { e.preventDefault(); window.dispatchEvent(new Event('sk-contact')) }
}
export const openContact = () => window.dispatchEvent(new Event('sk-contact'))
