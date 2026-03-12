// ============================================
// Trang Gợi ý tái chế (Bước 2)
// Gọi API AI (LLM) để lấy hướng dẫn tái chế dựa trên loại rác đã nhận diện
// Hiển thị: tên sản phẩm, mô tả, vật liệu, các bước, lợi ích, lưu ý an toàn
// ============================================

import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Sparkles, Loader2, AlertCircle, ArrowRight, Package, FileText, Wrench, ListOrdered, Heart, Shield, Lightbulb } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getRecycleIdea } from '../../api/llm'
import LoadingSpinner from '../shared/LoadingSpinner'

// ====== HÀM TIỆN ÍCH CHUẨN HÓA DỮ LIỆU ======
// Dữ liệu từ API AI có thể không đồng nhất (string, array, null, ...) → cần chuẩn hóa

// Đảm bảo giá trị luôn là mảng (dùng cho danh sách vật liệu, bước thực hiện, ...)
function ensureArray(val) {
  if (Array.isArray(val)) return val
  if (val == null || val === '') return []
  return [String(val)]
}

// Đảm bảo giá trị luôn là chuỗi (dùng cho mô tả, tên sản phẩm, ...)
function ensureString(val) {
  if (val == null) return ''
  return String(val)
}

export default function RecycleSuggestion() {
  const location = useLocation()
  const navigate = useNavigate()
  const { conversationId, setConversationIdFromApi } = useApp()
  // Lấy tên loại rác từ state được truyền qua React Router (từ trang Nhận diện rác)
  const wasteName = location.state?.wasteName

  const [loading, setLoading] = useState(true)       // Trạng thái đang gọi API
  const [error, setError] = useState('')              // Thông báo lỗi
  const [suggestion, setSuggestion] = useState(null)  // Dữ liệu gợi ý tái chế từ AI
  const [retryCount, setRetryCount] = useState(0)     // Số lần thử lại (trigger useEffect)

  // ====== GỌI API LẤY GỢI Ý TÁI CHẾ ======
  // Tự động gọi khi có wasteName mới hoặc khi người dùng nhấn "Thử lại"
  useEffect(() => {
    if (!wasteName) {
      setError('Không có thông tin loại rác. Hãy nhận diện rác trước.')
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    const call = async () => {
      try {
        // Reset conversationId khi có wasteName mới để bắt đầu cuộc hội thoại mới
        // Chỉ giữ conversationId cũ khi retry để AI nhớ ngữ cảnh
        const freshConversationId = retryCount === 0 ? '' : conversationId
        const { suggestion: s, conversationId: cid } = await getRecycleIdea(wasteName, freshConversationId)
        if (!cancelled) {
          setSuggestion(s)
          setConversationIdFromApi(cid)
          setError('')
        }
      } catch (e) {
        console.error('API error:', e)
        if (!cancelled) {
          setError(e.message || 'Không lấy được gợi ý. Thử lại sau.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    call()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- conversationId dùng khi retry; tránh refetch khi API cập nhật
  }, [wasteName, retryCount])

  const handleRetry = () => {
    setRetryCount((c) => c + 1)
  }

  const handleCreateProduct = () => {
    navigate('/product', { state: { suggestion, wasteName } })
  }

  if (!wasteName) {
    return (
      <div className="max-w-2xl mx-auto p-6 animate-fade-in">
        <div className="card-interactive p-5 flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 rounded-xl flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-amber-800 text-sm">{error}</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          Quay lại nhận diện rác
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 min-h-[40vh] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Đang lấy gợi ý tái chế từ AI..." />
      </div>
    )
  }

  if (error && !suggestion) {
    return (
      <div className="max-w-2xl mx-auto p-6 animate-fade-in">
        <div className="card-interactive p-5 flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-xl flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleRetry} className="btn-primary">
            Thử lại
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary">
            Quay lại nhận diện
          </button>
        </div>
      </div>
    )
  }

  // Nếu không có dữ liệu gợi ý sau khi load xong → hiển thị lỗi
  if (!suggestion && !loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 animate-fade-in">
        <div className="card-interactive p-5 flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 rounded-xl flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-amber-800 text-sm">Không nhận được dữ liệu từ API. Vui lòng thử lại.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleRetry} className="btn-primary">
            Thử lại
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary">
            Quay lại nhận diện
          </button>
        </div>
      </div>
    )
  }

  // ====== TRÍCH XUẤT DỮ LIỆU TỪ PHẢN HỒI AI ======
  // API có thể trả về camelCase hoặc snake_case → hỗ trợ cả 2 format
  const name = ensureString(
    suggestion?.tenVatDung ?? suggestion?.ten_vat_dung ?? suggestion?.name ?? wasteName
  )
  const desc = ensureString(
    suggestion?.moTaNgan ?? suggestion?.mo_ta ?? suggestion?.mo_ta_ngan ?? suggestion?.description ?? ''
  )
  // Danh sách vật liệu cần chuẩn bị
  const materials = ensureArray(
    suggestion?.vatLieuCanCo ?? suggestion?.vat_lieu ?? suggestion?.materials ?? []
  )
  // Các bước hướng dẫn thực hiện tái chế
  const steps = ensureArray(
    suggestion?.cacBuocThucHien ?? suggestion?.cac_buoc ?? suggestion?.steps ?? []
  )
  // Lợi ích và lưu ý an toàn - có thể là string hoặc array tùy phản hồi AI
  const benefitsRaw = suggestion?.loiIch ?? suggestion?.loi_ich ?? suggestion?.benefits
  const benefits = Array.isArray(benefitsRaw) ? benefitsRaw : benefitsRaw ? [benefitsRaw] : []
  const safetyRaw = suggestion?.luuYAnToan ?? suggestion?.luu_y_an_toan ?? suggestion?.safety
  const safety = Array.isArray(safetyRaw) ? safetyRaw : safetyRaw ? [safetyRaw] : []
  const tipsRaw = suggestion?.loiKhuyenGiamRac ?? suggestion?.loi_khuyen_giam_rac
  const tips = Array.isArray(tipsRaw) ? tipsRaw : tipsRaw ? [tipsRaw] : []

  return (
    <div className="max-w-3xl mx-auto p-6 animate-fade-in-up">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md shadow-green-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Bước 2: Gợi ý tái chế</h1>
            <p className="text-sm text-gray-400">Loại rác: <strong className="text-green-600">{wasteName}</strong></p>
          </div>
        </div>
      </div>

      {/* Tên sản phẩm - Card lớn với gradient */}
      <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl shadow-lg shadow-green-500/20 p-6 mb-6 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <h2 className="text-2xl font-bold relative z-10">{name || 'Sản phẩm tái chế'}</h2>
      </div>

      <div className="space-y-4 mb-6">
        {/* Mô tả ngắn */}
        {desc && (
          <div className="card-interactive p-5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <FileText className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-700">Mô tả ngắn</h3>
            </div>
            <p className="text-gray-600 leading-relaxed pl-9">{desc}</p>
          </div>
        )}

        {/* Vật liệu cần có */}
        {materials.length > 0 && (
          <div className="card-interactive p-5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Wrench className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-700">Vật liệu cần có</h3>
            </div>
            <ul className="space-y-2 pl-9">
              {materials.map((m, i) => (
                <li key={i} className="flex gap-2.5 text-gray-600">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2.5 flex-shrink-0" />
                  <span className="leading-6">{typeof m === 'string' ? m : m?.ten ?? m}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Các bước thực hiện */}
        {steps.length > 0 && (
          <div className="card-interactive p-5 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <ListOrdered className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-semibold text-purple-700">Các bước thực hiện</h3>
            </div>
            <ol className="space-y-3 pl-9">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-gray-600">
                  <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                    {i + 1}
                  </span>
                  <span className="leading-6">{typeof s === 'string' ? s : s?.noi_dung ?? s}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Lợi ích */}
        {benefits.length > 0 && (
          <div className="card-interactive p-5 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <Heart className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-emerald-700">Lợi ích</h3>
            </div>
            <ul className="space-y-2 pl-9">
              {benefits.map((b, i) => (
                <li key={i} className="flex gap-2.5 text-gray-600">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2.5 flex-shrink-0" />
                  <span className="leading-6">{typeof b === 'string' ? b : b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lời khuyên giảm rác */}
        {tips.length > 0 && (
          <div className="card-interactive p-5 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 bg-yellow-100 rounded-lg">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-yellow-700">Lời khuyên giảm rác</h3>
            </div>
            <ul className="space-y-2 pl-9">
              {tips.map((t, i) => (
                <li key={i} className="flex gap-2.5 text-gray-600">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2.5 flex-shrink-0" />
                  <span className="leading-6">{typeof t === 'string' ? t : t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lưu ý an toàn */}
        {safety.length > 0 && (
          <div className="bg-amber-50/80 backdrop-blur-sm rounded-2xl shadow-card border-2 border-amber-200/60 p-5 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 bg-amber-200 rounded-lg">
                <Shield className="w-4 h-4 text-amber-700" />
              </div>
              <h3 className="font-semibold text-amber-800">⚠️ Lưu ý an toàn</h3>
            </div>
            <ul className="space-y-2 pl-9">
              {safety.map((s, i) => (
                <li key={i} className="text-amber-800 leading-6 text-sm">
                  {typeof s === 'string' ? s : s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Nút tạo sản phẩm */}
      <div className="card-interactive p-5 mb-5">
        <button
          onClick={handleCreateProduct}
          className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base"
        >
          <Package className="w-5 h-5" />
          Tạo sản phẩm & lưu vào Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Nút điều hướng */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex-1 btn-secondary py-3"
        >
          Nhận diện lại
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          Xem Green Dashboard
        </button>
      </div>
    </div>
  )
}
