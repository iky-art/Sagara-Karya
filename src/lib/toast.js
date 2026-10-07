export const toast = (m) => window.dispatchEvent(new CustomEvent('sk-toast', { detail: m }))
