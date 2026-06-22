import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {env} from 'node:process'

// https://vite.dev/config/
export default defineConfig({
  base: env.VITE_BASE_PATH || '/',
  plugins: [react()],
  resolve: { dedupe: ['react', 'react-dom'] },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api': { target: 'http://127.0.0.1:5000', changeOrigin: true },
    },
  },
})
