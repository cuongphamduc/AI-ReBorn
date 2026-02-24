// ============================================
// Trang Green Dashboard - Bảng điều khiển xanh
// Hiển thị tổng quan: sản phẩm tái chế, Điểm Xanh, lượt nhận diện
// Timeline hoạt động: gộp lịch sử nhận diện + tạo sản phẩm theo thời gian
// ============================================

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Award, Package, Leaf, Plus, Camera } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function GreenDashboard() {
  const { products, recognitionHistory } = useApp()

  const totalProducts = products.length
  // Tính Điểm Xanh: mỗi sản phẩm tái chế = 10 điểm (khuyến khích tái chế)
  const greenScore = totalProducts * 10

  // ====== TẠO TIMELINE HOẠT ĐỘNG ======
  // Gộp sự kiện nhận diện rác và tạo sản phẩm, sắp xếp mới nhất trước, giới hạn 20 sự kiện
  const timeline = useMemo(() => {
    const events = []
    recognitionHistory.forEach(({ label, timestamp, imageUrl }) => {
      events.push({ type: 'recognition', label, imageUrl, date: new Date(timestamp) })
    })
    products.forEach(({ name, wasteType, createdAt, image }) => {
      events.push({
        type: 'product',
        name,
        wasteType,
        image,
        date: new Date(createdAt),
      })
    })
    events.sort((a, b) => b.date - a.date)
    return events.slice(0, 20)
  }, [products, recognitionHistory])

  // Hàm định dạng thời gian tương đối (VD: "5 phút trước", "2 giờ trước")
  const formatDate = (d) => {
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'Vừa xong'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`
    return d.toLocaleDateString('vi-VN')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-8 flex items-center gap-2">
        <Leaf className="w-7 h-7" />
        Green Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <Package className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Tổng sản phẩm tái chế</p>
            <p className="text-2xl font-bold text-green-700">{totalProducts}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-xl">
            <Award className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Điểm Xanh</p>
            <p className="text-2xl font-bold text-amber-700">{greenScore}</p>
            <p className="text-xs text-gray-500">(sản phẩm × 10)</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Camera className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Lượt nhận diện</p>
            <p className="text-2xl font-bold text-blue-700">{recognitionHistory.length}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-green-700">Sản phẩm của tôi</h2>
        <Link
          to="/product"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-green-50 rounded-xl border border-green-100 p-8 text-center">
          <Package className="w-12 h-12 text-green-400 mx-auto mb-2" />
          <p className="text-green-700 font-medium mb-2">Chưa có sản phẩm nào</p>
          <p className="text-gray-600 text-sm mb-4">Nhận diện rác → Lấy gợi ý → Tạo sản phẩm và lưu tại đây.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            <Camera className="w-4 h-4" />
            Bắt đầu nhận diện
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden"
            >
              <div className="aspect-square bg-green-50 flex items-center justify-center">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-12 h-12 text-green-400" />
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-green-800 truncate">{p.name}</p>
                <p className="text-xs text-gray-500">{p.wasteType}</p>
                <p className="text-xs text-gray-400">
                  {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-lg font-semibold text-green-700 mb-4">Timeline hoạt động</h2>
      {timeline.length === 0 ? (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center text-gray-500">
          Chưa có hoạt động nào.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-green-100 divide-y divide-green-100">
          {timeline.map((ev, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              {ev.type === 'recognition' && ev.imageUrl ? (
                <img
                  src={ev.imageUrl}
                  alt={ev.label}
                  className="w-12 h-12 rounded-lg object-cover border-2 border-blue-200 shrink-0"
                />
              ) : ev.type === 'product' && ev.image ? (
                <img
                  src={ev.image}
                  alt={ev.name}
                  className="w-12 h-12 rounded-lg object-cover border-2 border-green-200 shrink-0"
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    ev.type === 'product' ? 'bg-green-100' : 'bg-blue-100'
                  }`}
                >
                  {ev.type === 'product' ? (
                    <Package className="w-5 h-5 text-green-600" />
                  ) : (
                    <Camera className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {ev.type === 'product' ? (
                  <>
                    <p className="font-medium text-green-800">Đã tạo: {ev.name}</p>
                    <p className="text-sm text-gray-500">Từ: {ev.wasteType}</p>
                  </>
                ) : (
                  <p className="font-medium text-blue-800">Nhận diện: {ev.label}</p>
                )}
              </div>
              <span className="text-sm text-gray-500 shrink-0">{formatDate(ev.date)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
