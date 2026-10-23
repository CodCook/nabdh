// Renders the PWA PNG icons from public/icons/icon.svg
import sharp from 'sharp'
import { readFileSync } from 'node:fs'

const svg = readFileSync(new URL('../public/icons/icon.svg', import.meta.url))
for (const size of [192, 512]) {
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(new URL(`../public/icons/icon-${size}.png`, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
  console.log('wrote icon-' + size + '.png')
}
