import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['vite.svg', 'icon-192x192.png', 'icon-512x512.png', 'favicon.svg'],
      manifest: {
        name: 'Home Storage Organizer',
        short_name: 'Home Storage Organizer',
        description: 'Organize home storage with bins, QR codes, and offline access.',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/home-storage-organizer/',
        icons: [
          {
            src: 'icon-192x192',
            sizes: '192x192',
            type: "image/png"
          },
          {
            src: 'icon-512x512',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: '/home-storage-organizer/'
});
