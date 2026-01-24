import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Sparkles, Loader2, AlertCircle, ArrowRight, Package } from 'lucide-react'
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
        const { suggestion: s, conversationId: cid } = await getRecycleIdea(wasteName, conversationId)
        console.log('Received suggestion:', s)
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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-2 flex items-center gap-2">
        <Sparkles className="w-7 h-7" />
        Bước 2: Gợi ý tái chế
      </h1>
      <p className="text-gray-600 mb-6">Loại rác: <strong>{wasteName}</strong></p>

      <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden mb-6">
        <div className="bg-green-50 px-6 py-4 border-b border-green-100">
          <h2 className="text-lg font-semibold text-green-800">{name || 'Sản phẩm tái chế'}</h2>
        </div>
        <div className="p-6 space-y-6">
          {desc ? (
            <div>
              <h3 className="font-semibold text-green-700 mb-1">Mô tả ngắn</h3>
              <p className="text-gray-700">{desc}</p>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-green-700 mb-1">Mô tả ngắn</h3>
              <p className="text-gray-500 italic">Đang tải mô tả...</p>
            </div>
          )}
          {materials.length > 0 && (
            <div>
              <h3 className="font-semibold text-green-700 mb-1">Vật liệu cần có</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {materials.map((m, i) => (
                  <li key={i}>{typeof m === 'string' ? m : m?.ten ?? m}</li>
                ))}
              </ul>
            </div>
          )}
          {steps.length > 0 && (
            <div>
              <h3 className="font-semibold text-green-700 mb-1">Các bước thực hiện</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-1">
                {steps.map((s, i) => (
                  <li key={i}>{typeof s === 'string' ? s : s?.noi_dung ?? s}</li>
                ))}
              </ol>
            </div>
          )}
          {benefits.length > 0 && (
            <div>
              <h3 className="font-semibold text-green-700 mb-1">Lợi ích</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {benefits.map((b, i) => (
                  <li key={i}>{typeof b === 'string' ? b : b}</li>
                ))}
              </ul>
            </div>
          )}
          {safety.length > 0 && (
            <div>
              <h3 className="font-semibold text-amber-700 mb-1">Lưu ý an toàn</h3>
              <ul className="list-disc list-inside text-amber-800 space-y-1">
                {safety.map((s, i) => (
                  <li key={i}>{typeof s === 'string' ? s : s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={handleCreateProduct}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg"
          >
            <Package className="w-5 h-5" />
            Tạo sản phẩm & lưu vào Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => navigate('/')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg"
        >
          Nhận diện lại
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Xem Green Dashboard
        </button>
      </div>
    </div>
  )
}
