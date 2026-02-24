// ============================================
// Component gốc của ứng dụng AI ReBorn - GreenLab
// Định nghĩa cấu trúc routing (điều hướng) và layout chung
// ============================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Navigation from './components/shared/Navigation'

// Import các trang Admin
import Login from './components/admin/Login'
import ModelManager from './components/admin/ModelManager'
import Statistics from './components/admin/Statistics'

// Import các trang Học sinh
import WasteRecognition from './components/student/WasteRecognition'
import RecycleSuggestion from './components/student/RecycleSuggestion'
import ProductCreation from './components/student/ProductCreation'
import GreenDashboard from './components/student/GreenDashboard'

/**
 * Component bảo vệ route Admin
 * Nếu chưa đăng nhập admin → tự động chuyển hướng về trang login
 */
function ProtectedAdmin({ children }) {
  const { adminUser } = useApp()
  if (!adminUser) return <Navigate to="/admin/login" replace />
  return children
}

/**
 * Định nghĩa tất cả các route (đường dẫn) trong ứng dụng
 * - /admin/*: Các trang quản trị (cần đăng nhập)
 * - /: Trang nhận diện rác (trang chính)
 * - /suggestion: Trang gợi ý tái chế từ AI
 * - /product: Trang tạo/lưu sản phẩm tái chế
 * - /dashboard: Bảng điều khiển xanh (thống kê cá nhân)
 */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin/model"
        element={
          <ProtectedAdmin>
            <ModelManager />
          </ProtectedAdmin>
        }
      />
      <Route
        path="/admin/stats"
        element={
          <ProtectedAdmin>
            <Statistics />
          </ProtectedAdmin>
        }
      />
      <Route path="/" element={<WasteRecognition />} />
      <Route path="/suggestion" element={<RecycleSuggestion />} />
      <Route path="/product" element={<ProductCreation />} />
      <Route path="/dashboard" element={<GreenDashboard />} />
      {/* Route mặc định: chuyển hướng tất cả đường dẫn không hợp lệ về trang chính */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

/**
 * Component App chính - Bọc toàn bộ ứng dụng trong AppProvider (Context) và BrowserRouter (Router)
 * basename="/aireborn" - ứng dụng được host tại đường dẫn /aireborn/
 */
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename="/aireborn">
        <div className="min-h-screen bg-green-50">
          <Navigation />
          <main className="max-w-6xl mx-auto py-8">
            <AppRoutes />
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
