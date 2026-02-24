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
      <div className="max-w-xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-green-100 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-green-700 mb-2">Đã lưu sản phẩm!</h2>
          <p className="text-gray-600 mb-6">Sản phẩm của bạn đã được thêm vào Green Dashboard.</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Xem Dashboard
            </button>
            <button
              onClick={() => { setDone(false); setName(''); setWasteType(''); setImage(null); }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg"
            >
              Thêm sản phẩm khác
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6 flex items-center gap-2">
        <Package className="w-7 h-7" />
        Bước 3: Lưu sản phẩm
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 border border-green-100 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-green-700 mb-1">Tên sản phẩm</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="VD: Hộp đựng bút từ chai nhựa"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-green-700 mb-1">Loại rác</label>
          <input
            type="text"
            value={wasteType}
            onChange={(e) => setWasteType(e.target.value)}
            className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="VD: Chai nhựa"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-green-700 mb-1">Ảnh sản phẩm hoàn thành</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-green-300 rounded-xl cursor-pointer hover:bg-green-50 transition"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {image ? (
              <img src={image} alt="Preview" className="max-h-48 rounded-lg object-contain" />
            ) : (
              <Upload className="w-12 h-12 text-green-500" />
            )}
            <span className="text-green-700 font-medium">
              {image ? 'Đổi ảnh khác' : 'Chọn ảnh tải lên'}
            </span>
          </div>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            Lưu sản phẩm
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg"
          >
            Bỏ qua
          </button>
        </div>
      </form>
    </div>
  )
}
