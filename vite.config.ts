/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['robots.txt', 'icons/favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: '滿東邨巴士實時到站',
        short_name: '滿東邨巴士',
        description: '滿東邨巴士實時到站時間屏（城巴／新大嶼山巴士）',
        lang: 'zh-Hant',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0019A8',
        background_color: '#FFFFFF',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigationPreload: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/rt\.data\.gov\.hk\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'data-gov-hk-eta',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})