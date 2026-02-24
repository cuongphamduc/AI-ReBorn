// ============================================
// Trang đăng nhập Admin
// Cho phép admin đăng nhập để quản lý model AI và xem thống kê
// ============================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, LogIn } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function Login() {
  // State quản lý form đăng nhập
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { loginAdmin } = useApp()
  const navigate = useNavigate()

  // Xử lý khi người dùng submit form đăng nhập
  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    // Gọi hàm đăng nhập từ AppContext - kiểm tra thông tin đăng nhập
    const ok = loginAdmin(username, password)
    if (ok) {
      // Đăng nhập thành công → chuyển đến trang quản lý model
      navigate('/admin/model')
    } else {
      // Thông báo lỗi chung - KHÔNG tiết lộ tài khoản/mật khẩu đúng
      setError('Sai tên đăng nhập hoặc mật khẩu.')
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Card đăng nhập với hiệu ứng glass */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-card hover:shadow-card-hover p-8 border border-green-100/50 transition-all duration-300">
          {/* Logo và tiêu đề */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 mb-4 animate-bounce-in">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gradient">Đăng nhập Admin</h1>
            <p className="text-gray-400 text-sm mt-1">Quản lý hệ thống AI ReBorn</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên đăng nhập</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Nhập tên đăng nhập"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-fade-in">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full btn-primary flex items-center justify-center gap-2 py-3"
            >
              <LogIn className="w-4 h-4" />
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
