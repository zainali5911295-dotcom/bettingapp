import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    include: ['@pixi/react', 'pixi.js'],
    exclude: ['@pixi/sound', '@pixi/graphics', '@pixi/sprite-animated']
  },

  define: {
    global: 'globalThis'
  },

  server: {
    port: 5174,
    strictPort: true,
    hmr: true
  }
})