import { useState } from 'react'
import { Save, Play, AlertCircle, Loader2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { loadTeachableModel } from '../../utils/teachableMachine'

export default function ModelManager() {
  const { modelURL, updateModelURL } = useApp()
  const [inputURL, setInputURL] = useState(modelURL)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSave = () => {
    if (!inputURL.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập URL model.' })
      return
    }
    try {
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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Quản lý Teachable Machine Model</h1>
      <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-green-700 mb-1">URL Model</label>
          <p className="text-xs text-gray-500 mb-2">
            Format: https://teachablemachine.withgoogle.com/models/[MODEL_ID]/
          </p>
          <input
            type="url"
            value={inputURL}
            onChange={(e) => setInputURL(e.target.value)}
            className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="https://teachablemachine.withgoogle.com/models/xxx/"
          />
        </div>
        <p className="text-sm text-gray-600">
          <strong>URL hiện tại:</strong> {modelURL || '—'}
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <Save className="w-4 h-4" />
            Lưu model
          </button>
          <button
            onClick={handleTest}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
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
            className={`flex items-center gap-2 p-3 rounded-lg ${
              message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}
      </div>
    </div>
  )
}
