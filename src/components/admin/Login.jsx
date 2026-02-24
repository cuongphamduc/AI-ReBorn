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
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border border-green-100">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Leaf className="w-10 h-10 text-green-600" />
          <h1 className="text-2xl font-bold text-green-700">Đăng nhập Admin</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-green-700 mb-1">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-green-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <LogIn className="w-4 h-4" />
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  )
}
