import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Upload, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { loadTeachableModel, predictImage } from '../../utils/teachableMachine'

const MIN_CONFIDENCE = 0.5

export default function WasteRecognition() {
  const { modelURL, addRecognition } = useApp()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const modelRef = useRef(null)
  const loopRef = useRef(null)
  const capturedRef = useRef(false) // Flag để dừng loop sau khi chụp ảnh

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [previewImage, setPreviewImage] = useState(null) // data URL để hiển thị ảnh đã chụp/upload
  const [webcamOk, setWebcamOk] = useState(false)
  const [mode, setMode] = useState('webcam') // 'webcam' | 'upload'

  // Khởi tạo model khi vào trang
  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    setResult(null) // Reset result khi load model mới
    modelRef.current = null // Clear model cũ
    
    loadTeachableModel(modelURL)
      .then((model) => {
        if (mounted) {
          modelRef.current = model
          setLoading(false)
          console.log('✅ Model loaded successfully from:', modelURL)
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(`Không tải được model: ${err.message}`)
          setLoading(false)
          console.error('❌ Model load error:', err)
        }
      })
    return () => {
      mounted = false
      if (loopRef.current) cancelAnimationFrame(loopRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [modelURL])

  // Bật webcam: chỉ lấy stream, set webcamOk. Video gán stream + play trong useEffect (vì <video> mới render khi webcamOk=true)
  const startWebcam = useCallback(async () => {
    setError('')
    setResult(null)
    setPreviewImage(null)
    capturedRef.current = false // Reset flag khi bật lại webcam
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      streamRef.current = stream
      setWebcamOk(true)
      console.log('✅ Webcam stream acquired')
    } catch (e) {
      setWebcamOk(false)
      console.error('Webcam error:', e)
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setError('Không có quyền truy cập webcam. Vui lòng cho phép quyền camera và thử lại.')
      } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        setError('Không tìm thấy webcam. Hãy dùng "Tải ảnh lên" thay thế.')
      } else {
        setError(`Không thể bật webcam: ${e.message}. Hãy dùng "Tải ảnh lên" thay thế.`)
      }
    }
  }, [])

  // Gán stream vào video và play (chạy sau khi <video> đã mount vì webcamOk=true)
  useEffect(() => {
    if (!webcamOk || !streamRef.current) return
    const video = videoRef.current
    if (!video) return

    video.srcObject = streamRef.current
    video.play()
      .then(() => console.log('✅ Video playing'))
      .catch((err) => console.warn('Video play error:', err))

    return () => {
      video.srcObject = null
    }
  }, [webcamOk])

  useEffect(() => {
    if (!webcamOk || !videoRef.current || !modelRef.current) return
    const video = videoRef.current
    let isRunning = true
    let lastPredictTime = 0
    const PREDICT_INTERVAL = 500 // Predict mỗi 500ms để tránh quá tải

    const runPrediction = async () => {
      if (!isRunning) return
      
      // Dừng loop nếu đã chụp ảnh
      if (capturedRef.current) {
        return
      }
      
      // Kiểm tra video đã sẵn sàng
      if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        loopRef.current = requestAnimationFrame(runPrediction)
        return
      }

      // Throttle predictions
      const now = Date.now()
      if (now - lastPredictTime < PREDICT_INTERVAL) {
        loopRef.current = requestAnimationFrame(runPrediction)
        return
      }
      lastPredictTime = now

      try {
        if (modelRef.current && video) {
          const { top } = await predictImage(modelRef.current, video)
          if (isRunning && top && !capturedRef.current) {
            setResult({ label: top.className, confidence: top.probability })
          }
        }
      } catch (err) {
        console.warn('Prediction error in loop:', err)
        // Tiếp tục loop ngay cả khi có lỗi
      }
      
      if (isRunning && !capturedRef.current) {
        loopRef.current = requestAnimationFrame(runPrediction)
      }
    }
    
    // Đợi video load xong trước khi bắt đầu predict
    const startLoop = () => {
      if (video.readyState >= 2) {
        runPrediction()
      } else {
        video.addEventListener('loadeddata', runPrediction, { once: true })
      }
    }
    
    startLoop()
    
    return () => {
      isRunning = false
      if (loopRef.current) {
        cancelAnimationFrame(loopRef.current)
      }
      if (video) {
        video.removeEventListener('loadeddata', runPrediction)
      }
    }
  }, [webcamOk])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !modelRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setPreviewImage(dataUrl)
    
    // Đánh dấu đã chụp để dừng prediction loop
    capturedRef.current = true
    
    // Dừng prediction loop
    if (loopRef.current) {
      cancelAnimationFrame(loopRef.current)
      loopRef.current = null
    }
    
    predictImage(modelRef.current, canvas).then(({ top, predictions }) => {
      // Validate class name
      const validClasses = predictions.map(p => p.className)
      if (!validClasses.includes(top.className)) {
        console.error('⚠️ Invalid class detected:', top.className)
        console.error('Valid classes:', validClasses)
        setError(`Cảnh báo: Class "${top.className}" không hợp lệ. Model có thể đã thay đổi. Vui lòng reload trang.`)
      }
      setResult({ label: top.className, confidence: top.probability })
      addRecognition(top.className, top.probability, dataUrl)
    }).catch((err) => {
      console.error('Prediction error:', err)
      setError('Lỗi khi nhận diện. Vui lòng thử lại.')
    })
  }, [addRecognition])

  const handleFileUpload = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (!modelRef.current) {
        setError('Model chưa sẵn sàng. Admin vui lòng cấu hình model hoặc thử lại sau.')
        return
      }
      setError('')
      setResult(null)
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result
        setPreviewImage(dataUrl)
        const img = new Image()
        img.onload = () => {
        const c = document.createElement('canvas')
        c.width = img.width
        c.height = img.height
        const ctx = c.getContext('2d')
        ctx.drawImage(img, 0, 0)
        predictImage(modelRef.current, c).then(({ top, predictions }) => {
          // Validate class name
          const validClasses = predictions.map(p => p.className)
          if (!validClasses.includes(top.className)) {
            console.error('⚠️ Invalid class detected:', top.className)
            console.error('Valid classes:', validClasses)
            setError(`Cảnh báo: Class "${top.className}" không hợp lệ. Model có thể đã thay đổi. Vui lòng reload trang.`)
          }
          setResult({ label: top.className, confidence: top.probability })
          addRecognition(top.className, top.probability, dataUrl)
        }).catch((err) => {
          console.error('Prediction error:', err)
          setError('Lỗi khi nhận diện. Vui lòng thử lại.')
        })
        }
        img.onerror = () => setError('Không đọc được ảnh. Chọn file ảnh hợp lệ.')
        img.src = dataUrl
      }
      reader.readAsDataURL(file)
      e.target.value = ''
    },
    [addRecognition]
  )

  const goToSuggestion = () => {
    if (result && result.confidence >= MIN_CONFIDENCE) {
      navigate('/suggestion', { state: { wasteName: result.label, confidence: result.confidence } })
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
        <p className="text-green-700 font-medium">Đang tải model nhận diện...</p>
      </div>
    )
  }

  if (error && !webcamOk && !result && !modelRef.current) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700 mb-4">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
        <p className="text-gray-600 mb-4">Admin vui lòng kiểm tra URL model tại trang Quản lý Model.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Bước 1: Nhận diện rác</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            setMode('webcam')
            setResult(null)
            setPreviewImage(null)
            setError('')
            capturedRef.current = false // Reset flag để cho phép prediction loop chạy lại
            // Dừng stream cũ nếu có
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((t) => t.stop())
              streamRef.current = null
            }
            setWebcamOk(false)
            startWebcam()
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition ${
            mode === 'webcam' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          <Camera className="w-5 h-5" />
          Webcam
        </button>
        <button
          onClick={() => {
            setMode('upload')
            setResult(null)
            setPreviewImage(null)
            setWebcamOk(false)
            capturedRef.current = false // Reset flag
            // Dừng stream webcam
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((t) => t.stop())
              streamRef.current = null
            }
            if (videoRef.current) {
              videoRef.current.srcObject = null
            }
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition ${
            mode === 'upload' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          <Upload className="w-5 h-5" />
          Tải ảnh
        </button>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-amber-800 mb-4">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {mode === 'webcam' && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 space-y-4">
          {!webcamOk ? (
            <div className="aspect-video bg-green-50 rounded-xl flex flex-col items-center justify-center gap-4">
              <Camera className="w-16 h-16 text-green-400" />
              <button
                onClick={startWebcam}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg"
              >
                Bật webcam
              </button>
            </div>
          ) : (
            <>
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <button
                onClick={capturePhoto}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg"
              >
                <Camera className="w-5 h-5" />
                Chụp ảnh
              </button>
            </>
          )}
        </div>
      )}

      {mode === 'upload' && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
          <label className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-green-300 rounded-xl cursor-pointer hover:bg-green-50 transition">
            <Upload className="w-12 h-12 text-green-500" />
            <span className="text-green-700 font-medium">Chọn ảnh rác để nhận diện</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}

      {result && (
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-green-100">
          {previewImage && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-green-700 mb-2">Ảnh đã chụp / tải lên</p>
              <img
                src={previewImage}
                alt="Preview"
                className="w-full max-h-64 object-contain rounded-xl border border-green-200 bg-green-50"
              />
            </div>
          )}
          <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
            {result.confidence >= MIN_CONFIDENCE ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500" />
            )}
            Kết quả: {result.label} ({(result.confidence * 100).toFixed(1)}%)
          </div>
          {result.confidence >= MIN_CONFIDENCE ? (
            <button
              onClick={goToSuggestion}
              className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg"
            >
              Xem gợi ý tái chế →
            </button>
          ) : (
            <p className="text-amber-700 text-sm">Độ tin cậy thấp. Hãy chụp lại hoặc tải ảnh rõ hơn.</p>
          )}
        </div>
      )}
    </div>
  )
}
