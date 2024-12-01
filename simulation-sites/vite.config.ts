import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'

export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
  ],
  base: '/simulation-site/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
})
