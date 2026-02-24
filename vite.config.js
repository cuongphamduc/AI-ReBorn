// ============================================
// Cấu hình Vite - Công cụ build và dev server cho ứng dụng React
// ============================================

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/aireborn/',   // Đường dẫn gốc khi deploy (ứng dụng nằm tại domain/aireborn/)
  server: {
    host: '0.0.0.0',
    allowedHosts: ['aispeech.ptit.edu.vn'],  // Cho phép truy cập từ domain này
  },
})
