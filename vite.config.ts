import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'node:child_process'

// Shown in the "Jak to działa?" sheet, to tell which build someone is running
function buildVersion(): string {
  const date = new Date().toISOString().slice(0, 10)
  try {
    const sha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
    return `${date} · ${sha}`
  } catch {
    return `${date} · dev`
  }
}

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // The new service worker waits until the app applies it (src/hooks/useAppUpdate.ts),
      // so the old version keeps its cached files, lazy chunks included, until the reload
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Plan Zajęć - Pielęgniarstwo 2025/2026',
        short_name: 'Plan Zajęć',
        description: 'Plan zajęć dla studentów pielęgniarstwa',
        theme_color: '#F5F5F4',
        background_color: '#F5F5F4',
        display: 'standalone',
        scope: '/pielegniarstwo-lessons/',
        start_url: '/pielegniarstwo-lessons/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        cleanupOutdatedCaches: true
      }
    })
  ],
  base: '/pielegniarstwo-lessons/',
  define: {
    __APP_VERSION__: JSON.stringify(buildVersion())
  }
})
