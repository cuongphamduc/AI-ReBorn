import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Sparkles, Loader2, AlertCircle, ArrowRight, Package, FileText, Wrench, ListOrdered, Heart, Shield } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getRecycleIdea } from '../../api/llm'
import LoadingSpinner from '../shared/LoadingSpinner'

// Chuẩn hóa field từ response LLM (có thể là object hoặc array)
function ensureArray(val) {
  if (Array.isArray(val)) return val
  if (val == null || val === '') return []
  return [String(val)]
}

function ensureString(val) {
  if (val == null) return ''
  return String(val)
}

export default function RecycleSuggestion() {
  const location = useLocation()
  const navigate = useNavigate()
  const { conversationId, setConversationIdFromApi } = useApp()
  const wasteName = location.state?.wasteName

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [suggestion, setSuggestion] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

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
        // Luôn reset conversationId khi có wasteName mới để bắt đầu conversation mới
        // Chỉ dùng conversationId cũ khi retry (retryCount > 0)
        const freshConversationId = retryCount === 0 ? '' : conversationId
        console.log('🟡 Calling API with wasteName:', wasteName, 'conversationId:', freshConversationId, 'retryCount:', retryCount)
        const { suggestion: s, conversationId: cid } = await getRecycleIdea(wasteName, freshConversationId)
        console.log('🟡 Received suggestion:', s)
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
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-2 text-amber-800">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Quay lại nhận diện rác
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <LoadingSpinner size="lg" label="Đang lấy gợi ý tái chế từ AI..." />
      </div>
    )
  }

  if (error && !suggestion) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700 mb-4">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleRetry}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Thử lại
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg"
          >
            Quay lại nhận diện
          </button>
        </div>
      </div>
    )
  }

  // Nếu không có suggestion sau khi load xong, hiển thị lỗi
  if (!suggestion && !loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-2 text-amber-800 mb-4">
          <AlertCircle className="w-5 h-5 shrink-0" />
          Không nhận được dữ liệu từ API. Vui lòng thử lại.
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleRetry}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Thử lại
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg"
          >
            Quay lại nhận diện
          </button>
        </div>
      </div>
    )
  }

  // Hỗ trợ cả camelCase (từ API thực tế) và snake_case
  const name = ensureString(
    suggestion?.tenVatDung ?? suggestion?.ten_vat_dung ?? suggestion?.name ?? wasteName
  )
  const desc = ensureString(
    suggestion?.moTaNgan ?? suggestion?.mo_ta ?? suggestion?.mo_ta_ngan ?? suggestion?.description ?? ''
  )
  const materials = ensureArray(
    suggestion?.vatLieuCanCo ?? suggestion?.vat_lieu ?? suggestion?.materials ?? []
  )
  const steps = ensureArray(
    suggestion?.cacBuocThucHien ?? suggestion?.cac_buoc ?? suggestion?.steps ?? []
  )
  // loiIch và luuYAnToan có thể là string hoặc array
  const benefitsRaw = suggestion?.loiIch ?? suggestion?.loi_ich ?? suggestion?.benefits
  const benefits = Array.isArray(benefitsRaw) ? benefitsRaw : benefitsRaw ? [benefitsRaw] : []
  const safetyRaw = suggestion?.luuYAnToan ?? suggestion?.luu_y_an_toan ?? suggestion?.safety
  const safety = Array.isArray(safetyRaw) ? safetyRaw : safetyRaw ? [safetyRaw] : []

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-2 flex items-center gap-2">
        <Sparkles className="w-7 h-7" />
        Bước 2: Gợi ý tái chế
      </h1>
      <p className="text-gray-600 mb-6">Loại rác: <strong className="text-green-700">{wasteName}</strong></p>

      {/* Tên sản phẩm - Card lớn */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 mb-6 text-white">
        <h2 className="text-2xl font-bold">{name || 'Sản phẩm tái chế'}</h2>
      </div>

      <div className="space-y-4 mb-6">
        {/* Mô tả ngắn */}
        {desc && (
          <div className="bg-white rounded-xl shadow-md border border-green-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-700 text-lg">Mô tả ngắn</h3>
            </div>
            <p className="text-gray-700 leading-relaxed pl-7">{desc}</p>
          </div>
        )}

        {/* Vật liệu cần có */}
        {materials.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-700 text-lg">Vật liệu cần có</h3>
            </div>
            <ul className="space-y-2 pl-7">
              {materials.map((m, i) => (
                <li key={i} className="flex gap-2 text-gray-700">
                  <span className="text-blue-500 flex-shrink-0 leading-6">•</span>
                  <span className="leading-6">{typeof m === 'string' ? m : m?.ten ?? m}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Các bước thực hiện */}
        {steps.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border border-purple-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <ListOrdered className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-700 text-lg">Các bước thực hiện</h3>
            </div>
            <ol className="space-y-3 pl-7">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-gray-700">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-semibold">
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
          <div className="bg-white rounded-xl shadow-md border border-green-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-700 text-lg">Lợi ích</h3>
            </div>
            <ul className="space-y-2 pl-7">
              {benefits.map((b, i) => (
                <li key={i} className="flex gap-2 text-gray-700">
                  <span className="text-green-500 flex-shrink-0 leading-6">•</span>
                  <span className="leading-6">{typeof b === 'string' ? b : b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lưu ý an toàn */}
        {safety.length > 0 && (
          <div className="bg-amber-50 rounded-xl shadow-md border-2 border-amber-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-amber-700" />
              <h3 className="font-semibold text-amber-800 text-lg">Lưu ý an toàn</h3>
            </div>
            <ul className="space-y-2 pl-7">
              {safety.map((s, i) => (
                <li key={i} className="text-amber-900 leading-6">
                  {typeof s === 'string' ? s : s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Nút tạo sản phẩm */}
      <div className="bg-white rounded-xl shadow-lg border border-green-200 p-6 mb-6">
        <button
          onClick={handleCreateProduct}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 rounded-lg transition shadow-md hover:shadow-lg"
        >
          <Package className="w-5 h-5" />
          Tạo sản phẩm & lưu vào Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Nút điều hướng */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/')}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition"
        >
          Nhận diện lại
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition"
        >
          Xem Green Dashboard
        </button>
      </div>
    </div>
  )
}
