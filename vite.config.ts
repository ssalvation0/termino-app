import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// In production the app is served from https://ssalvation0.github.io/termino-app/,
// so the base must match the repo name. Dev stays at '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/termino-app/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: Number(process.env.PORT) || 5173,
  },
}))
