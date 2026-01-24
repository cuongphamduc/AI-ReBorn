import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Leaf, LayoutDashboard, Camera, Sparkles, Package, Award, LogOut } from 'lucide-react'
import { useApp } from '../../context/AppContext'

// Icon khiên với cây bên trong
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
  const isAdmin = !!adminUser

  const studentNav = [
    { path: '/', label: 'Nhận diện rác', icon: Camera },
    { path: '/suggestion', label: 'Gợi ý tái chế', icon: Sparkles },
    { path: '/product', label: 'Tạo sản phẩm', icon: Package },
    { path: '/dashboard', label: 'Green Dashboard', icon: Award },
  ]

  const adminNav = [
    { path: '/admin/model', label: 'Quản lý Model', icon: Camera },
    { path: '/admin/stats', label: 'Thống kê', icon: LayoutDashboard },
  ]

  const nav = isAdmin ? adminNav : studentNav

  return (
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to={isAdmin ? '/admin/model' : '/'} className="flex items-center gap-2 font-semibold">
            <Leaf className="w-6 h-6" />
            <span>AI ReBorn - GreenLab</span>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            {nav.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition ${
                  location.pathname === path ? 'bg-green-500' : 'hover:bg-green-500/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {isAdmin ? (
              <button
                onClick={() => { logoutAdmin(); navigate('/'); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium hover:bg-green-500/80 transition"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium hover:bg-green-500/80 transition"
              >
                <ShieldTreeIcon className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
