const K = 'sk-usage'
let u = {}
try { u = JSON.parse(localStorage.getItem(K) || '{}') } catch (e) { u = {} }
try {
  if (!sessionStorage.getItem('sk-counted')) {
    u.opens = (u.opens || 0) + 1; u.first = u.first || Date.now()
    localStorage.setItem(K, JSON.stringify(u)); sessionStorage.setItem('sk-counted', '1')
  }
} catch (e) {}
export const usage = () => u
