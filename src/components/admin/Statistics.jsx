// ============================================
// Trang Thống kê (dành cho Admin)
// Hiển thị biểu đồ thống kê nhận diện rác, quản lý lịch sử nhận diện
// Sử dụng thư viện Recharts để vẽ biểu đồ cột và biểu đồ tròn
// ============================================

import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useApp } from '../../context/AppContext'
import { Trash2, Package, Award, AlertTriangle, X, CheckSquare, Square } from 'lucide-react'

// Bảng màu cho biểu đồ tròn (top 3 loại rác phổ biến)
const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Statistics() {
  const { recognitionHistory, products, clearRecognitionHistory, removeRecognition, removeMultipleRecognitions } = useApp()
  const [showConfirm, setShowConfirm] = useState(false)      // Hiển thị dialog xác nhận xóa
  const [selectedIds, setSelectedIds] = useState(new Set())    // Danh sách ID đã chọn để xóa
  const [showHistory, setShowHistory] = useState(false)        // Toggle hiển thị danh sách lịch sử

  const handleClear = () => {
    clearRecognitionHistory()
    setShowConfirm(false)
    setSelectedIds(new Set())
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAll = () => {
    setSelectedIds(new Set(recognitionHistory.map((item) => item.id)))
  }

  const deselectAll = () => {
    setSelectedIds(new Set())
  }

  const handleDeleteSelected = () => {
    if (selectedIds.size > 0) {
      removeMultipleRecognitions(Array.from(selectedIds))
      setSelectedIds(new Set())
    }
  }

  const formatDate = (timestamp) => {
    const d = new Date(timestamp)
    return d.toLocaleString('vi-VN')
  }

  // Tính toán dữ liệu thống kê từ lịch sử nhận diện (dùng useMemo để tối ưu hiệu năng)
  const { barData, top3, totalRecycled } = useMemo(() => {
    // Đếm số lần nhận diện theo từng loại rác
    const countByLabel = {}
    recognitionHistory.forEach(({ label }) => {
      countByLabel[label] = (countByLabel[label] || 0) + 1
    })
    // Chuyển đổi thành dạng mảng cho biểu đồ cột
    const barData = Object.entries(countByLabel).map(([name, count]) => ({ name, count }))
    // Lấy top 3 loại rác có số lượng nhận diện nhiều nhất cho biểu đồ tròn
    const top3 = barData
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((d, i) => ({ ...d, color: COLORS[i % COLORS.length] }))
    return {
      barData,
      top3,
      totalRecycled: products.length,
    }
  }, [recognitionHistory, products])

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gradient">Dashboard thống kê</h1>
          <p className="text-sm text-gray-400 mt-1">Tổng quan hoạt động nhận diện và tái chế</p>
        </div>
        {recognitionHistory.length > 0 && (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Xóa toàn bộ lịch sử
          </button>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border border-red-100 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Xác nhận xóa</h2>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              Bạn có chắc chắn muốn xóa toàn bộ <strong className="text-red-600">{recognitionHistory.length}</strong> lượt nhận diện? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClear}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 active:scale-[0.98]"
              >
                Xóa
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 btn-secondary"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card-interactive p-5 flex items-center gap-4 group">
          <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-md shadow-green-500/20 group-hover:shadow-green-500/30 transition-shadow">
            <Trash2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Tổng lượt nhận diện rác</p>
            <p className="text-2xl font-bold text-gray-800">{recognitionHistory.length}</p>
          </div>
        </div>
        <div className="card-interactive p-5 flex items-center gap-4 group">
          <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Sản phẩm tái chế đã tạo</p>
            <p className="text-2xl font-bold text-gray-800">{totalRecycled}</p>
          </div>
        </div>
        <div className="card-interactive p-5 flex items-center gap-4 group">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-md shadow-amber-500/20 group-hover:shadow-amber-500/30 transition-shadow">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Điểm Xanh (×10)</p>
            <p className="text-2xl font-bold text-gray-800">{totalRecycled * 10}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Lịch sử nhận diện</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`font-semibold py-2 px-4 rounded-xl transition-all duration-200 text-sm ${
                showHistory 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              {showHistory ? 'Ẩn danh sách' : 'Hiển thị danh sách'}
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Xóa đã chọn ({selectedIds.size})
              </button>
            )}
          </div>
        </div>

        {showHistory && recognitionHistory.length > 0 && (
          <div className="card-interactive mb-6 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                {selectedIds.size === recognitionHistory.length ? (
                  <button onClick={deselectAll} className="text-green-600 hover:text-green-700">
                    <CheckSquare className="w-5 h-5" />
                  </button>
                ) : (
                  <button onClick={selectAll} className="text-gray-400 hover:text-green-600">
                    <Square className="w-5 h-5" />
                  </button>
                )}
                <span className="text-sm text-gray-500">
                  {selectedIds.size > 0 ? `Đã chọn ${selectedIds.size}/${recognitionHistory.length}` : 'Chọn tất cả'}
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-100/80 max-h-96 overflow-y-auto">
              {recognitionHistory.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-green-50/30 transition-colors duration-200">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.label}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-sm"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                    <p className="text-xs text-gray-400">
                      Độ tin cậy: {(item.confidence * 100).toFixed(1)}% • {formatDate(item.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeRecognition(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                    title="Xóa"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {showHistory && recognitionHistory.length === 0 && (
          <div className="card-interactive p-6 text-center text-gray-400 mb-6">
            Chưa có lịch sử nhận diện.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-interactive p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Số lượng rác nhận diện theo loại</h2>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="count" fill="url(#greenGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 py-8 text-center text-sm">Chưa có dữ liệu nhận diện.</p>
          )}
        </div>

        <div className="card-interactive p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top 3 loại rác phổ biến</h2>
          {top3.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={top3}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  label={({ name, count }) => `${name} (${count})`}
                  stroke="none"
                >
                  {top3.map((_, i) => (
                    <Cell key={i} fill={top3[i].color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 py-8 text-center text-sm">Chưa có dữ liệu.</p>
          )}
        </div>
      </div>
    </div>
  )
}
