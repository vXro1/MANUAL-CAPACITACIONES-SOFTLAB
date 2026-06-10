import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/uploads': {
        target: 'https://semillerosoftlab.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Vite 8 (Rolldown) requiere manualChunks como función
        manualChunks(id) {
          // Core React
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // Framer Motion — pesado, cachear aparte
          if (id.includes('node_modules/framer-motion/')) {
            return 'vendor-motion';
          }
          // PDF viewer — solo ManualDetailPage lo carga (lazy)
          if (id.includes('node_modules/react-pdf/') ||
              id.includes('node_modules/pdfjs-dist/')) {
            return 'vendor-pdf';
          }
          // Admin — chunk separado, usuarios públicos no lo descargan
          if (id.includes('/pages/AdminPage/')) {
            return 'chunk-admin';
          }
        },
      },
    },
  },
})
