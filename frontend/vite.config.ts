import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // `npm run dev`: the app calls the relative `/api` path, like behind Nginx in production.
  server: {
    proxy: { '/api': process.env.BACKEND_URL ?? 'http://localhost:3000' },
  },
})
