import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Django (port 8000) is the ONLY backend. In dev, /api, /media and /static
// are proxied to it; in production serve the built client from the same
// origin (or set VITE_API_BASE_URL to the Django API origin).
const DJANGO_DEV = process.env.DJANGO_DEV_URL || 'http://localhost:8000';

export default defineConfig({
  // Relative asset paths so the built dist/index.html works when opened
  // directly (file://) as well as when served from any sub-path.
  base: './',
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: DJANGO_DEV, changeOrigin: true },
      '/media': { target: DJANGO_DEV, changeOrigin: true },
      '/static': { target: DJANGO_DEV, changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['gsap'],
          i18n: ['i18next', 'react-i18next'],
        },
      },
    },
  },
});

