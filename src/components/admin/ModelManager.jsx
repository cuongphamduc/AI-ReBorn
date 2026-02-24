// ============================================
// Trang Quản lý Model Teachable Machine (dành cho Admin)
// Cho phép admin thay đổi URL model AI và kiểm tra model hoạt động
// ============================================

import { useState } from 'react'
import { Save, Play, AlertCircle, Loader2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { loadTeachableModel } from '../../utils/teachableMachine'

export default function ModelManager() {
  const { modelURL, updateModelURL } = useApp()
  const [inputURL, setInputURL] = useState(modelURL)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Xử lý lưu URL model mới - kiểm tra tính hợp lệ trước khi lưu
  const handleSave = () => {
    if (!inputURL.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập URL model.' })
      return
    }
    try {
      // Kiểm tra URL phải thuộc domain teachablemachine.withgoogle.com
      const url = new URL(inputURL.trim())
      if (!url.hostname.includes('teachablemachine.withgoogle.com')) {
        setMessage({ type: 'error', text: 'URL phải từ teachablemachine.withgoogle.com' })
        return
      }
    } catch {
      setMessage({ type: 'error', text: 'URL không hợp lệ.' })
      return
    }
    updateModelURL(inputURL.trim())
    setMessage({ type: 'success', text: 'Đã lưu URL model.' })
  }

  // Xử lý test model - thử load model để kiểm tra URL có hoạt động không
  const handleTest = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })
    try {
      await loadTeachableModel(inputURL.trim() || modelURL)
      setMessage({ type: 'success', text: 'Test model thành công! Model sẵn sàng sử dụng.' })
    } catch (err) {
      setMessage({
        type: 'error',
        text: `Load model thất bại: ${err.message}. Kiểm tra URL và kết nối mạng.`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 animate-fade-in-up">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gradient">Quản lý Teachable Machine Model</h1>
        <p className="text-sm text-gray-400 mt-1">Cấu hình URL model AI cho ứng dụng</p>
      </div>
      <div className="card-interactive p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">URL Model</label>
          <p className="text-xs text-gray-400 mb-2">
            Format: https://teachablemachine.withgoogle.com/models/[MODEL_ID]/
          </p>
          <input
            type="url"
            value={inputURL}
            onChange={(e) => setInputURL(e.target.value)}
            className="input-field"
            placeholder="https://teachablemachine.withgoogle.com/models/xxx/"
          />
        </div>
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
          <span className="text-sm text-gray-500">
            <strong>URL hiện tại:</strong> <span className="text-gray-700">{modelURL || '—'}</span>
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Lưu model
          </button>
          <button
            onClick={handleTest}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Play className="w-4 h-4" />
                Test model
              </>
            )}
            {loading && <span>Đang test...</span>}
          </button>
        </div>
        {message.text && (
          <div
            className={`flex items-center gap-2.5 p-3.5 rounded-xl text-sm animate-fade-in ${
              message.type === 'error' 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}
      </div>
    </div>
  )
}
