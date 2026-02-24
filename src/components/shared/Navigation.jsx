// ============================================
// Thanh điều hướng (Navigation Bar) chung cho toàn ứng dụng
// Hiển thị menu khác nhau tùy theo vai trò: Học sinh hoặc Admin
// Hỗ trợ responsive: mobile hamburger menu
// ============================================

import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Leaf, LayoutDashboard, Camera, Sparkles, Package, Award, LogOut, Menu, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'

// Component SVG tùy chỉnh: Icon hình khiên với cây bên trong (dùng cho nút Admin)
function ShieldTreeIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Khiên */}
      <path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z" />
      {/* Cây - thân */}
      <path d="M12 14v4" strokeWidth="2" />
      {/* Cây - lá (hình tròn) */}
      <circle cx="12" cy="10" r="3" fill="currentColor" opacity="0.8" />
      <circle cx="10" cy="8" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="14" cy="8" r="2" fill="currentColor" opacity="0.6" />
    </svg>
  )
}

export default function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { adminUser, logoutAdmin } = useApp()
  const isAdmin = !!adminUser  // Kiểm tra đã đăng nhập admin chưa
  const [mobileOpen, setMobileOpen] = useState(false) // Toggle menu mobile
  const [scrolled, setScrolled] = useState(false) // Theo dõi scroll để thêm hiệu ứng

  // Theo dõi scroll để thay đổi style navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Đóng mobile menu khi chuyển trang
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Menu điều hướng cho Học sinh (4 bước: Nhận diện → Gợi ý → Tạo sản phẩm → Dashboard)
  const studentNav = [
    { path: '/', label: 'Nhận diện rác', icon: Camera },
    { path: '/suggestion', label: 'Gợi ý tái chế', icon: Sparkles },
    { path: '/product', label: 'Tạo sản phẩm', icon: Package },
    { path: '/dashboard', label: 'Green Dashboard', icon: Award },
  ]

  // Menu điều hướng cho Admin (Quản lý model AI và xem thống kê)
  const adminNav = [
    { path: '/admin/model', label: 'Quản lý Model', icon: Camera },
    { path: '/admin/stats', label: 'Thống kê', icon: LayoutDashboard },
  ]

  // Chọn menu phù hợp dựa trên vai trò người dùng
  const nav = isAdmin ? adminNav : studentNav

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-green-600/95 backdrop-blur-md shadow-lg shadow-green-900/10' 
        : 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-md'
    }`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to={isAdmin ? '/admin/model' : '/'} 
            className="flex items-center gap-2.5 font-bold text-white group"
          >
            <div className="p-1.5 bg-white/15 rounded-lg group-hover:bg-white/25 transition-colors duration-200">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="text-lg tracking-tight">AI ReBorn</span>
            <span className="hidden sm:inline text-green-200 text-sm font-medium">GreenLab</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1.5">
            {nav.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive 
                      ? 'bg-white/20 text-white shadow-inner' 
                      : 'text-green-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {/* Active indicator dot */}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                  )}
                </Link>
              )
            })}

            {/* Divider */}
            <div className="w-px h-6 bg-white/20 mx-1" />

            {isAdmin ? (
              <button
                onClick={() => { logoutAdmin(); navigate('/'); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm text-green-100 hover:bg-red-500/20 hover:text-white transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm text-green-100 hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                <ShieldTreeIcon className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-fade-in-down">
            <div className="bg-white/10 rounded-2xl p-2 space-y-1 backdrop-blur-sm">
              {nav.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'text-green-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </Link>
                )
              })}
              
              <div className="h-px bg-white/10 mx-2" />

              {isAdmin ? (
                <button
                  onClick={() => { logoutAdmin(); navigate('/'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-green-100 hover:bg-red-500/20 hover:text-white transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  Đăng xuất
                </button>
              ) : (
                <Link
                  to="/admin/login"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-green-100 hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  <ShieldTreeIcon className="w-5 h-5" />
                  Admin
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
