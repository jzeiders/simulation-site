import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import { comlink } from "vite-plugin-comlink";


export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
    comlink(),
  ],
  base: '/simulation-site/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  worker: {
    plugins: () => [comlink()],
  },
})
