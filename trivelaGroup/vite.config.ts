import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  // React mora biti JEDNA kopija — inace @react-three/fiber (svoj reconciler)
  // padne na "Invalid hook call / dual React".
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'three', '@react-three/fiber'],
  },
  server: {
    open: true,
    port: 5173,
  },
})
