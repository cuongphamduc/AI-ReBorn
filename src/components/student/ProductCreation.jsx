// ============================================
// Trang Tạo sản phẩm tái chế (Bước 3)
// Cho phép học sinh nhập tên, loại rác, ảnh sản phẩm và lưu vào Dashboard
// ============================================

import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Package, Upload, Loader2, CheckCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function ProductCreation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { addProduct } = useApp()
  const fileInputRef = useRef(null)  // Tham chiếu đến input file ẩn

  // Lấy dữ liệu gợi ý và tên loại rác từ trang trước (truyền qua Router state)
  const suggestion = location.state?.suggestion
  const wasteName = location.state?.wasteName || ''

  // State form nhập liệu
  const [name, setName] = useState(suggestion?.ten_vat_dung ?? suggestion?.name ?? '')
  const [wasteType, setWasteType] = useState(wasteName)
  const [image, setImage] = useState(null)     // Ảnh sản phẩm dạng base64 data URL
  const [saving, setSaving] = useState(false)   // Trạng thái đang lưu
  const [done, setDone] = useState(false)       // Đã lưu thành công
  const [error, setError] = useState('')        // Thông báo lỗi

  // Xử lý khi người dùng chọn ảnh sản phẩm
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh (jpg, png, ...).')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result)
    reader.readAsDataURL(file)
  }

  // Xử lý submit form - lưu sản phẩm vào Context (và localStorage)
  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Vui lòng nhập tên sản phẩm.')
      return
    }
    setSaving(true)
    // Thêm sản phẩm mới vào danh sách (Context sẽ tự lưu vào localStorage)
    addProduct({
      name: name.trim(),
      wasteType: wasteType || 'Khác',
      image,
      createdAt: new Date().toISOString(),
    })
    setSaving(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto p-6 animate-fade-in">
        <div className="card-interactive p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-500/30 animate-bounce-in">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gradient mb-2">Đã lưu sản phẩm!</h2>
          <p className="text-gray-500 mb-6">Sản phẩm của bạn đã được thêm vào Green Dashboard.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              Xem Dashboard
            </button>
            <button
              onClick={() => { setDone(false); setName(''); setWasteType(''); setImage(null); }}
              className="btn-secondary"
            >
              Thêm sản phẩm khác
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto p-6 animate-fade-in-up">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md shadow-green-500/20">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Bước 3: Lưu sản phẩm</h1>
            <p className="text-sm text-gray-400">Nhập thông tin sản phẩm tái chế của bạn</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-interactive p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên sản phẩm</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="VD: Hộp đựng bút từ chai nhựa"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Loại rác</label>
          <input
            type="text"
            value={wasteType}
            onChange={(e) => setWasteType(e.target.value)}
            className="input-field"
            placeholder="VD: Chai nhựa"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ảnh sản phẩm hoàn thành</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 py-8 border-2 border-dashed border-green-200 rounded-2xl cursor-pointer hover:bg-green-50/50 hover:border-green-400 transition-all duration-300 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {image ? (
              <img src={image} alt="Preview" className="max-h-48 rounded-xl object-contain" />
            ) : (
              <div className="p-3 bg-green-50 group-hover:bg-green-100 rounded-2xl transition-colors">
                <Upload className="w-10 h-10 text-green-400 group-hover:text-green-500 transition-colors" />
              </div>
            )}
            <span className="text-green-700 font-medium text-sm">
              {image ? 'Đổi ảnh khác' : 'Chọn ảnh tải lên'}
            </span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            Lưu sản phẩm
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary py-3 px-6"
          >
            Bỏ qua
          </button>
        </div>
      </form>
    </div>
  )
}
