// ============================================
// Trang Green Dashboard - Bảng điều khiển xanh
// Hiển thị tổng quan: sản phẩm tái chế, Điểm Xanh, lượt nhận diện
// Timeline hoạt động: gộp lịch sử nhận diện + tạo sản phẩm theo thời gian
// ============================================

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, Package, Leaf, Plus, Camera, X, Calendar, Recycle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import LazyImage from '../shared/LazyImage'

export default function GreenDashboard() {
  const { products, recognitionHistory } = useApp()
  const [selectedProduct, setSelectedProduct] = useState(null) // Sản phẩm đang xem chi tiết

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
    <div className="max-w-4xl mx-auto p-6 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md shadow-green-500/20">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gradient">Green Dashboard</h1>
        </div>
        <p className="text-gray-400 text-sm ml-12">Theo dõi hành trình tái chế của bạn</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card-interactive p-5 flex items-center gap-4 group">
          <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-md shadow-green-500/20 group-hover:shadow-green-500/30 transition-shadow">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Tổng sản phẩm tái chế</p>
            <p className="text-2xl font-bold text-gray-800">{totalProducts}</p>
          </div>
        </div>
        <div className="card-interactive p-5 flex items-center gap-4 group">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-md shadow-amber-500/20 group-hover:shadow-amber-500/30 transition-shadow">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Điểm Xanh</p>
            <p className="text-2xl font-bold text-gray-800">{greenScore}</p>
            <p className="text-xs text-gray-400">(sản phẩm × 10)</p>
          </div>
        </div>
        <div className="card-interactive p-5 flex items-center gap-4 group">
          <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Lượt nhận diện</p>
            <p className="text-2xl font-bold text-gray-800">{recognitionHistory.length}</p>
          </div>
        </div>
      </div>

      {/* My Products Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Sản phẩm của tôi</h2>
        <Link
          to="/product"
          className="btn-primary flex items-center gap-2 text-sm py-2"
        >
          <Plus className="w-4 h-4" />
          Thêm sản phẩm
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="card-interactive p-8 text-center mb-8">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Package className="w-7 h-7 text-green-400" />
          </div>
          <p className="text-gray-700 font-medium mb-1">Chưa có sản phẩm nào</p>
          <p className="text-gray-400 text-sm mb-5">Nhận diện rác → Lấy gợi ý → Tạo sản phẩm và lưu tại đây.</p>
          <Link
            to="/"
            className="btn-primary inline-flex items-center gap-2"
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
              onClick={() => setSelectedProduct(p)}
              className="card-interactive overflow-hidden group cursor-pointer"
            >
              <LazyImage
                src={p.image}
                alt={p.name}
                className="aspect-square group-hover:scale-105 transition-transform duration-500"
                fallback={
                  <div className="aspect-square bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                    <Package className="w-10 h-10 text-green-300" />
                  </div>
                }
              />
              <div className="p-3">
                <p className="font-semibold text-gray-800 truncate text-sm">{p.name}</p>
                <p className="text-xs text-gray-400">{p.wasteType}</p>
                <p className="text-xs text-gray-300 mt-0.5">
                  {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Timeline hoạt động</h2>
      {timeline.length === 0 ? (
        <div className="card-interactive p-6 text-center text-gray-400">
          Chưa có hoạt động nào.
        </div>
      ) : (
        <div className="card-interactive divide-y divide-gray-100/80">
          {timeline.map((ev, i) => (
            <div key={i} className="flex items-center gap-4 p-4 hover:bg-green-50/30 transition-colors duration-200">
              {ev.type === 'recognition' && ev.imageUrl ? (
                <LazyImage
                  src={ev.imageUrl}
                  alt={ev.label}
                  className="w-11 h-11 rounded-xl border-2 border-blue-100 shrink-0 shadow-sm"
                />
              ) : ev.type === 'product' && ev.image ? (
                <LazyImage
                  src={ev.image}
                  alt={ev.name}
                  className="w-11 h-11 rounded-xl border-2 border-green-100 shrink-0 shadow-sm"
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    ev.type === 'product' 
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                      : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                  }`}
                >
                  {ev.type === 'product' ? (
                    <Package className="w-4 h-4 text-white" />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {ev.type === 'product' ? (
                  <>
                    <p className="font-medium text-gray-800 text-sm">Đã tạo: {ev.name}</p>
                    <p className="text-xs text-gray-400">Từ: {ev.wasteType}</p>
                  </>
                ) : (
                  <p className="font-medium text-gray-800 text-sm">Nhận diện: {ev.label}</p>
                )}
              </div>
              <span className="text-xs text-gray-400 shrink-0">{formatDate(ev.date)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Modal chi tiết sản phẩm */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header với nút đóng */}
            <div className="relative">
              <LazyImage
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-64"
                fallback={
                  <div className="w-full h-64 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <Package className="w-20 h-20 text-green-300" />
                  </div>
                }
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              {/* Badge loại rác */}
              <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-green-700 shadow-md">
                <span className="flex items-center gap-1.5">
                  <Recycle className="w-4 h-4" />
                  {selectedProduct.wasteType}
                </span>
              </div>
            </div>

            {/* Nội dung */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedProduct.name}</h3>
              
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                <Calendar className="w-4 h-4" />
                <span>Tạo ngày {new Date(selectedProduct.createdAt).toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>

              {/* Thông tin thêm */}
              <div className="bg-green-50 rounded-xl p-4 mb-4">
                <p className="text-green-700 text-sm">
                  🌱 Sản phẩm này được tái chế từ <strong>{selectedProduct.wasteType}</strong>, 
                  góp phần giảm thiểu rác thải và bảo vệ môi trường!
                </p>
              </div>

              {/* Điểm xanh */}
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                <span className="text-amber-700 font-medium text-sm">Điểm Xanh nhận được</span>
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Award className="w-5 h-5" />
                  +10
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-full btn-primary py-3"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
