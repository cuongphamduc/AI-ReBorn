// ============================================
// Điểm khởi đầu (Entry Point) của ứng dụng React
// Render component App vào phần tử DOM có id="root"
// StrictMode giúp phát hiện lỗi tiềm ẩn trong quá trình phát triển
// ============================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Khởi tạo React root và render ứng dụng
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
