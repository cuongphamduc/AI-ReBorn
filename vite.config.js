import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/aireborn/',
  server: {
    allowedHosts: ['aispeech.ptit.edu.vn'],
  },
})
