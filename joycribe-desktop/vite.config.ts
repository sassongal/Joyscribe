import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  root: path.join(__dirname, 'react-app'),
  base: './', // Use relative paths for Electron
  plugins: [react()],
  build: {
    outDir: path.join(__dirname, 'build/react-app'),
    emptyOutDir: true,
  },
})
