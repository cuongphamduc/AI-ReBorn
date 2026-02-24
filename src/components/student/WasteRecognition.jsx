// ============================================
// Trang Nhận diện rác (Bước 1)
// Cho phép học sinh sử dụng webcam hoặc tải ảnh lên để nhận diện loại rác
// Sử dụng model Teachable Machine (AI) để phân loại ảnh
// ============================================

import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Upload, Loader2, AlertCircle, CheckCircle, Scan, ArrowRight } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { loadTeachableModel, predictImage } from '../../utils/teachableMachine'
import LoadingSpinner from '../shared/LoadingSpinner'

// Ngưỡng độ tin cậy tối thiểu (50%) - dưới ngưỡng này sẽ cảnh báo kết quả không chắc chắn
const MIN_CONFIDENCE = 0.5

export default function WasteRecognition() {
  const { modelURL, addRecognition } = useApp()
  const navigate = useNavigate()
  
  // Các ref để truy cập trực tiếp DOM elements và giữ giá trị không gây re-render
  const videoRef = useRef(null)      // Tham chiếu đến phần tử <video> hiển thị webcam
  const canvasRef = useRef(null)     // Tham chiếu đến <canvas> để chụp ảnh từ video
  const streamRef = useRef(null)     // Luồng MediaStream từ webcam
  const modelRef = useRef(null)      // Model AI đã load (giữ qua các lần render)
  const loopRef = useRef(null)       // ID của requestAnimationFrame (dùng để hủy loop)
  const capturedRef = useRef(false)  // Cờ đánh dấu đã chụp ảnh - dừng vòng lặp prediction

  const [loading, setLoading] = useState(false)        // Trạng thái đang tải model
  const [error, setError] = useState('')                // Thông báo lỗi
  const [result, setResult] = useState(null)            // Kết quả nhận diện { label, confidence }
  const [previewImage, setPreviewImage] = useState(null) // Data URL ảnh đã chụp/upload để hiển thị
  const [webcamOk, setWebcamOk] = useState(false)       // Webcam đã sẵn sàng chưa
  const [mode, setMode] = useState('webcam')            // Chế độ: 'webcam' hoặc 'upload'

  // ====== KHỞI TẠO MODEL AI ======
  // Tự động load model khi vào trang hoặc khi modelURL thay đổi
  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    setResult(null)               // Reset kết quả khi load model mới
    modelRef.current = null       // Xóa model cũ
    
    // Load model Teachable Machine từ URL (bất đồng bộ)
    loadTeachableModel(modelURL)
      .then((model) => {
        if (mounted) {
          modelRef.current = model
          setLoading(false)
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(`Không tải được model: ${err.message}`)
          setLoading(false)
        }
      })
    // Cleanup: hủy khi component unmount (tránh memory leak)
    return () => {
      mounted = false
      if (loopRef.current) cancelAnimationFrame(loopRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [modelURL])

  // ====== XỬ LÝ WEBCAM ======
  // Bật webcam: lấy stream video từ camera, set webcamOk để render phần tử <video>
  const startWebcam = useCallback(async () => {
    setError('')
    setResult(null)
    setPreviewImage(null)
    capturedRef.current = false   // Reset cờ chụp ảnh khi bật lại webcam
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    
    try {
      // Yêu cầu quyền truy cập camera (camera trước, độ phân giải 640x480)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      streamRef.current = stream
      setWebcamOk(true)
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

  // Gán stream vào phần tử <video> và bắt đầu phát
  // (chạy sau khi <video> đã mount vì webcamOk=true mới render <video>)
  useEffect(() => {
    if (!webcamOk || !streamRef.current) return
    const video = videoRef.current
    if (!video) return

    video.srcObject = streamRef.current
    video.play()
      .catch((err) => console.warn('Lỗi phát video:', err))

    return () => {
      video.srcObject = null
    }
  }, [webcamOk])

  // ====== VÒNG LẶP NHẬN DIỆN THỜI GIAN THỰC ======
  // Liên tục predict từ video webcam (mỗi 500ms) để hiển thị kết quả real-time
  useEffect(() => {
    if (!webcamOk || !videoRef.current || !modelRef.current) return
    const video = videoRef.current
    let isRunning = true
    let lastPredictTime = 0
    const PREDICT_INTERVAL = 500 // Nhận diện mỗi 500ms để tránh quá tải CPU/GPU

    const runPrediction = async () => {
      if (!isRunning) return
      
      // Dừng vòng lặp nếu đã chụp ảnh (chuyển sang chế độ phân tích ảnh tĩnh)
      if (capturedRef.current) {
        return
      }
      
      // Kiểm tra video đã sẵn sàng
      if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        loopRef.current = requestAnimationFrame(runPrediction)
        return
      }

      // Throttle: giới hạn tần suất predict để tiết kiệm tài nguyên
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
        console.warn('Lỗi trong vòng lặp prediction:', err)
        // Tiếp tục vòng lặp ngay cả khi có lỗi (để không bị dừng nhận diện)
      }
      
      if (isRunning && !capturedRef.current) {
        loopRef.current = requestAnimationFrame(runPrediction)
      }
    }
    
    // Đợi video sẵn sàng trước khi bắt đầu vòng lặp nhận diện
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

  // ====== CHỤP ẢNH TỪ WEBCAM ======
  // Chụp frame hiện tại từ video, vẽ lên canvas, và chạy nhận diện
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !modelRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)
    // Chuyển canvas thành data URL (ảnh JPEG chất lượng 90%)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setPreviewImage(dataUrl)
    
    // Đánh dấu đã chụp để dừng vòng lặp prediction real-time
    capturedRef.current = true
    
    // Dừng vòng lặp prediction
    if (loopRef.current) {
      cancelAnimationFrame(loopRef.current)
      loopRef.current = null
    }
    
    // Nhận diện ảnh đã chụp và lưu kết quả vào lịch sử
    predictImage(modelRef.current, canvas).then(({ top, predictions }) => {
      // Kiểm tra tính hợp lệ của class name
      const validClasses = predictions.map(p => p.className)
      if (!validClasses.includes(top.className)) {
        setError(`Cảnh báo: Class "${top.className}" không hợp lệ. Model có thể đã thay đổi. Vui lòng reload trang.`)
      }
      // Lưu kết quả nhận diện và thêm vào lịch sử
      setResult({ label: top.className, confidence: top.probability })
      addRecognition(top.className, top.probability, dataUrl)
    }).catch((err) => {
      console.error('Lỗi nhận diện:', err)
      setError('Lỗi khi nhận diện. Vui lòng thử lại.')
    })
  }, [addRecognition])

  // ====== XỬ LÝ TẢI ẢNH LÊN ======
  // Đọc file ảnh, vẽ lên canvas và chạy nhận diện
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
        // Tạo Image object từ data URL để vẽ lên canvas rồi predict
        const img = new Image()
        img.onload = () => {
        // Tạo canvas tạm để chứa ảnh (cần thiết cho model predict)
        const c = document.createElement('canvas')
        c.width = img.width
        c.height = img.height
        const ctx = c.getContext('2d')
        ctx.drawImage(img, 0, 0)
        // Nhận diện ảnh đã tải lên
        predictImage(modelRef.current, c).then(({ top, predictions }) => {
          // Kiểm tra tính hợp lệ của class name
          const validClasses = predictions.map(p => p.className)
          if (!validClasses.includes(top.className)) {
            setError(`Cảnh báo: Class "${top.className}" không hợp lệ. Model có thể đã thay đổi. Vui lòng reload trang.`)
          }
          // Lưu kết quả và thêm vào lịch sử nhận diện
          setResult({ label: top.className, confidence: top.probability })
          addRecognition(top.className, top.probability, dataUrl)
        }).catch((err) => {
          console.error('Lỗi nhận diện:', err)
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

  // ====== ĐIỀU HƯỚNG ĐẾN TRANG GỢI Ý TÁI CHẾ ======
  // Chỉ cho phép chuyển trang khi độ tin cậy >= ngưỡng tối thiểu
  const goToSuggestion = () => {
    if (result && result.confidence >= MIN_CONFIDENCE) {
      // Truyền tên loại rác và độ tin cậy sang trang gợi ý qua React Router state
      navigate('/suggestion', { state: { wasteName: result.label, confidence: result.confidence } })
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 flex flex-col items-center justify-center gap-4 min-h-[40vh]">
        <LoadingSpinner size="lg" label="Đang tải model nhận diện..." />
      </div>
    )
  }

  if (error && !webcamOk && !result && !modelRef.current) {
    return (
      <div className="max-w-2xl mx-auto p-6 animate-fade-in">
        <div className="card-interactive p-6">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl text-red-700 mb-4">
            <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-sm">{error}</p>
          </div>
          <p className="text-gray-500 text-sm mb-4">Admin vui lòng kiểm tra URL model tại trang Quản lý Model.</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 animate-fade-in-up">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md shadow-green-500/20">
            <Scan className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gradient">Bước 1: Nhận diện rác</h1>
            <p className="text-sm text-gray-400">Sử dụng webcam hoặc tải ảnh để AI phân loại</p>
          </div>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-5 p-1 bg-green-100/50 rounded-2xl">
        <button
          onClick={() => {
            setMode('webcam')
            setResult(null)
            setPreviewImage(null)
            setError('')
            capturedRef.current = false
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((t) => t.stop())
              streamRef.current = null
            }
            setWebcamOk(false)
            startWebcam()
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
            mode === 'webcam' 
              ? 'bg-white text-green-700 shadow-md' 
              : 'text-green-600 hover:text-green-700'
          }`}
        >
          <Camera className="w-4 h-4" />
          Webcam
        </button>
        <button
          onClick={() => {
            setMode('upload')
            setResult(null)
            setPreviewImage(null)
            setWebcamOk(false)
            capturedRef.current = false
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((t) => t.stop())
              streamRef.current = null
            }
            if (videoRef.current) {
              videoRef.current.srcObject = null
            }
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
            mode === 'upload' 
              ? 'bg-white text-green-700 shadow-md' 
              : 'text-green-600 hover:text-green-700'
          }`}
        >
          <Upload className="w-4 h-4" />
          Tải ảnh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 mb-4 animate-fade-in text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {mode === 'webcam' && (
        <div className="card-interactive p-5 space-y-4">
          {!webcamOk ? (
            <div className="aspect-video bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl flex flex-col items-center justify-center gap-4 border-2 border-dashed border-green-200">
              <div className="p-4 bg-white rounded-2xl shadow-card animate-float">
                <Camera className="w-12 h-12 text-green-400" />
              </div>
              <p className="text-green-600 font-medium">Camera chưa được bật</p>
              <button
                onClick={startWebcam}
                className="btn-primary flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Bật webcam
              </button>
            </div>
          ) : (
            <>
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-lg group">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                {/* Overlay viền scan */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-green-400 rounded-tl-lg" />
                  <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-green-400 rounded-tr-lg" />
                  <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-green-400 rounded-bl-lg" />
                  <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-green-400 rounded-br-lg" />
                </div>
                {/* Real-time label overlay */}
                {result && !previewImage && (
                  <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-sm font-medium flex items-center justify-between">
                    <span>{result.label}</span>
                    <span className="text-green-400">{(result.confidence * 100).toFixed(0)}%</span>
                  </div>
                )}
              </div>
              <button
                onClick={capturePhoto}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3"
              >
                <Camera className="w-5 h-5" />
                Chụp ảnh & Nhận diện
              </button>
            </>
          )}
        </div>
      )}

      {mode === 'upload' && (
        <div className="card-interactive p-5">
          <label className="flex flex-col items-center justify-center gap-3 py-12 border-2 border-dashed border-green-200 rounded-2xl cursor-pointer hover:bg-green-50/50 hover:border-green-400 transition-all duration-300 group">
            <div className="p-4 bg-green-50 group-hover:bg-green-100 rounded-2xl transition-colors duration-300">
              <Upload className="w-10 h-10 text-green-500 group-hover:text-green-600 transition-colors" />
            </div>
            <div className="text-center">
              <span className="text-green-700 font-semibold block">Chọn ảnh rác để nhận diện</span>
              <span className="text-gray-400 text-sm">JPG, PNG — Kéo thả hoặc click để chọn</span>
            </div>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      )}

      {result && (
        <div className="mt-5 card-interactive p-5 animate-fade-in-up">
          {previewImage && (
            <div className="mb-4">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full max-h-64 object-contain rounded-xl border border-green-100 bg-green-50/50"
              />
            </div>
          )}
          <div className="flex items-center gap-3 mb-3">
            {result.confidence >= MIN_CONFIDENCE ? (
              <div className="p-2 bg-green-100 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            ) : (
              <div className="p-2 bg-amber-100 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
            )}
            <div>
              <p className="font-bold text-gray-800">{result.label}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-32">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      result.confidence >= MIN_CONFIDENCE 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                        : 'bg-gradient-to-r from-amber-400 to-orange-500'
                    }`}
                    style={{ width: `${(result.confidence * 100).toFixed(0)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-600">{(result.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {result.confidence >= MIN_CONFIDENCE ? (
            <button
              onClick={goToSuggestion}
              className="mt-3 w-full btn-primary flex items-center justify-center gap-2 py-3"
            >
              Xem gợi ý tái chế
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <p className="text-amber-600 text-sm bg-amber-50 p-3 rounded-xl mt-2">
              ⚠️ Độ tin cậy thấp. Hãy chụp lại hoặc tải ảnh rõ hơn.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
