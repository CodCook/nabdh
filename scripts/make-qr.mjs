// Usage: npm run qr -- https://your-app.vercel.app   (or APP_URL=... npm run qr)
// Writes public/qr-app.svg pointing at <url>/app. The stage footer also renders its own QR at runtime.
import QRCode from 'qrcode'
import { writeFileSync } from 'node:fs'

const base = (process.argv[2] || process.env.APP_URL || '').replace(/\/+$/, '')
if (!base) {
  console.error('Pass the deployed URL: npm run qr -- https://your-app.vercel.app')
  process.exit(1)
}
const svg = await QRCode.toString(`${base}/app`, { type: 'svg', margin: 2, color: { dark: '#8A1538', light: '#F5F0E8' } })
writeFileSync(new URL('../public/qr-app.svg', import.meta.url), svg)
console.log(`public/qr-app.svg -> ${base}/app`)
