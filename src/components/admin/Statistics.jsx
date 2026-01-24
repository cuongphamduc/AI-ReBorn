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

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Statistics() {
  const { recognitionHistory, products, clearRecognitionHistory, removeRecognition, removeMultipleRecognitions } = useApp()
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [showHistory, setShowHistory] = useState(false)

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

  const { barData, top3, totalRecycled } = useMemo(() => {
    const countByLabel = {}
    recognitionHistory.forEach(({ label }) => {
      countByLabel[label] = (countByLabel[label] || 0) + 1
    })
    const barData = Object.entries(countByLabel).map(([name, count]) => ({ name, count }))
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-green-700">Dashboard thống kê</h1>
        {recognitionHistory.length > 0 && (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
            Xóa toàn bộ lịch sử nhận diện
          </button>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full border border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-red-700">Xác nhận xóa</h2>
            </div>
            <p className="text-gray-700 mb-6">
              Bạn có chắc chắn muốn xóa toàn bộ <strong>{recognitionHistory.length}</strong> lượt nhận diện? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClear}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Xóa
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <Trash2 className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tổng lượt nhận diện rác</p>
            <p className="text-2xl font-bold text-green-700">{recognitionHistory.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Package className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Sản phẩm tái chế đã tạo</p>
            <p className="text-2xl font-bold text-blue-700">{totalRecycled}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-xl">
            <Award className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Điểm Xanh (×10)</p>
            <p className="text-2xl font-bold text-amber-700">{totalRecycled * 10}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-green-700">Lịch sử nhận diện</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              {showHistory ? 'Ẩn danh sách' : 'Hiển thị danh sách'}
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
                Xóa đã chọn ({selectedIds.size})
              </button>
            )}
          </div>
        </div>

        {showHistory && recognitionHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-green-100 mb-6">
            <div className="p-4 border-b border-green-100 flex items-center justify-between">
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
                <span className="text-sm text-gray-600">
                  {selectedIds.size > 0 ? `Đã chọn ${selectedIds.size}/${recognitionHistory.length}` : 'Chọn tất cả'}
                </span>
              </div>
            </div>
            <div className="divide-y divide-green-100 max-h-96 overflow-y-auto">
              {recognitionHistory.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-green-50">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.label}
                      className="w-16 h-16 rounded-lg object-cover border border-green-200"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-green-800">{item.label}</p>
                    <p className="text-sm text-gray-500">
                      Độ tin cậy: {(item.confidence * 100).toFixed(1)}% • {formatDate(item.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeRecognition(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Xóa"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {showHistory && recognitionHistory.length === 0 && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center text-gray-500 mb-6">
            Chưa có lịch sử nhận diện.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
          <h2 className="text-lg font-semibold text-green-700 mb-4">Số lượng rác nhận diện theo loại</h2>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 py-8 text-center">Chưa có dữ liệu nhận diện.</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
          <h2 className="text-lg font-semibold text-green-700 mb-4">Top 3 loại rác phổ biến</h2>
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
                  label={({ name, count }) => `${name} (${count})`}
                >
                  {top3.map((_, i) => (
                    <Cell key={i} fill={top3[i].color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 py-8 text-center">Chưa có dữ liệu.</p>
          )}
        </div>
      </div>
    </div>
  )
}
