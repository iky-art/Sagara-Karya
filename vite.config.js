import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const sh = (c) => { try { return execSync(c, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() } catch (e) { return '' } }
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))
const [maj, min] = pkg.version.split('.')
const now = new Date()
const stamp = now.toISOString().slice(2, 16).replace(/[-:T]/g, '') // yymmddhhmm
// Versi: MAJOR.MINOR dari package.json, PATCH naik otomatis (jumlah commit; jika riwayat git dangkal, menit sejak 1 Okt 2026)
const count = sh('git rev-parse --is-shallow-repository') === 'true' ? '' : sh('git rev-list --count HEAD')
const patch = count || String(Math.floor((now.getTime() - Date.UTC(2026, 9, 1)) / 60000))
const version = `${maj}.${min}.${patch}`
const sha = (process.env.CF_PAGES_COMMIT_SHA || '').slice(0, 7) || sh('git rev-parse --short HEAD') || 'local'
const build = `${sha}-${stamp}`

const versionFile = {
  name: 'version-json',
  generateBundle() { this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version, build }) }) },
}

export default defineConfig({
  plugins: [react(), versionFile],
  define: { __APP_VERSION__: JSON.stringify(version), __BUILD_ID__: JSON.stringify(build) },
})
