import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'نبض',
        short_name: 'نبض',
        description: 'استراحات حركة قصيرة داخل يوم العمل',
        lang: 'ar',
        dir: 'rtl',
        start_url: '/app',
        scope: '/',
        display: 'standalone',
        background_color: '#F5F0E8',
        theme_color: '#8A1538',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: { navigateFallback: '/index.html' },
    }),
  ],
  test: { include: ['src/**/*.test.ts'] },
} as never)
