// ============================================
// Context toàn cục của ứng dụng AI ReBorn
// Quản lý trạng thái chung: đăng nhập admin, model URL, sản phẩm, lịch sử nhận diện
// Sử dụng React Context API để chia sẻ dữ liệu giữa các component
// ============================================

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

// Lấy thông tin đăng nhập admin từ biến môi trường (.env) - KHÔNG hardcode trong mã nguồn
const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin'

// Giá trị mặc định cho Model URL (Teachable Machine - mô hình nhận diện ảnh của Google)
// Lấy từ biến môi trường (.env), nếu không có thì dùng giá trị fallback
const DEFAULT_MODEL_URL = import.meta.env.VITE_DEFAULT_MODEL_URL || 'https://teachablemachine.withgoogle.com/models/B2Dp0LIcE/'

// Các key lưu trữ trong localStorage để dữ liệu không bị mất khi tải lại trang
const MODEL_URL_STORAGE_KEY = 'aireborn_model_url'
const PRODUCTS_STORAGE_KEY = 'aireborn_products'
const RECOGNITION_HISTORY_STORAGE_KEY = 'aireborn_recognition_history'

// Tạo React Context để chia sẻ state giữa các component con
const AppContext = createContext(null)

export function AppProvider({ children }) {
  // ====== TRẠNG THÁI ADMIN ======
  // Thông tin đăng nhập admin (chỉ lưu trong state, không persist - đăng xuất khi refresh trang)
  const [adminUser, setAdminUser] = useState(null)

  // ====== TRẠNG THÁI MODEL AI ======
  // URL của model Teachable Machine - Load từ localStorage hoặc dùng giá trị mặc định
  const [modelURL, setModelURL] = useState(() => {
    try {
      const saved = localStorage.getItem(MODEL_URL_STORAGE_KEY)
      return saved || DEFAULT_MODEL_URL
    } catch {
      return DEFAULT_MODEL_URL
    }
  })

  // ====== DANH SÁCH SẢN PHẨM TÁI CHẾ ======
  // Các sản phẩm tái chế đã được người dùng tạo - Load từ localStorage
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // ====== LỊCH SỬ NHẬN DIỆN RÁC ======
  // Lưu lại các lần nhận diện rác (để thống kê và hiển thị timeline)
  const [recognitionHistory, setRecognitionHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(RECOGNITION_HISTORY_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // ====== ID HỘI THOẠI LLM ======
  // Conversation ID dùng để duy trì ngữ cảnh khi gọi API chat AI
  const [conversationId, setConversationId] = useState('')

  // Hàm đăng nhập admin - so sánh với thông tin từ biến môi trường
  const loginAdmin = useCallback((username, password) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setAdminUser({ username })
      return true
    }
    return false
  }, [])

  // Hàm đăng xuất admin - xóa thông tin phiên đăng nhập
  const logoutAdmin = useCallback(() => {
    setAdminUser(null)
  }, [])

  // Hàm cập nhật URL model Teachable Machine (admin sử dụng)
  const updateModelURL = useCallback((url) => {
    // Chuẩn hóa URL - đảm bảo kết thúc bằng dấu /
    const normalized = url.endsWith('/') ? url : url + '/'
    setModelURL(normalized)
    // Lưu vào localStorage để giữ lại khi tải lại trang
    try {
      localStorage.setItem(MODEL_URL_STORAGE_KEY, normalized)
    } catch (err) {
      console.warn('⚠️ Không thể lưu model URL vào localStorage:', err)
    }
  }, [])

  // Tự động đồng bộ lịch sử nhận diện với localStorage khi có thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(RECOGNITION_HISTORY_STORAGE_KEY, JSON.stringify(recognitionHistory))
    } catch (err) {
      console.warn('⚠️ Không thể lưu lịch sử nhận diện vào localStorage:', err)
    }
  }, [recognitionHistory])

  // Tự động đồng bộ danh sách sản phẩm với localStorage khi có thay đổi
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products))
    } catch (err) {
      console.warn('⚠️ Không thể lưu danh sách sản phẩm vào localStorage:', err)
    }
  }, [products])

  // Thêm một lần nhận diện vào lịch sử (gọi sau khi model AI nhận diện rác thành công)
  const addRecognition = useCallback((label, confidence, imageUrl = null) => {
    setRecognitionHistory((prev) => {
      // Tạo ID duy nhất bằng cách kết hợp timestamp và chuỗi ngẫu nhiên
      const newItem = { id: Date.now().toString() + Math.random().toString(36).substr(2, 9), label, confidence, imageUrl, timestamp: new Date().toISOString() }
      return [...prev, newItem]
    })
  }, [])

  // Xóa toàn bộ lịch sử nhận diện
  const clearRecognitionHistory = useCallback(() => {
    setRecognitionHistory([])
  }, [])

  // Xóa một lần nhận diện cụ thể theo ID
  const removeRecognition = useCallback((id) => {
    setRecognitionHistory((prev) => prev.filter((item) => item.id !== id))
  }, [])

  // Xóa nhiều lần nhận diện cùng lúc theo danh sách ID
  const removeMultipleRecognitions = useCallback((ids) => {
    setRecognitionHistory((prev) => prev.filter((item) => !ids.includes(item.id)))
  }, [])

  // Thêm sản phẩm tái chế mới vào danh sách
  const addProduct = useCallback((product) => {
    setProducts((prev) => {
      const newProduct = { ...product, id: Date.now().toString(), createdAt: new Date().toISOString() }
      return [...prev, newProduct]
    })
  }, [])

  // Cập nhật conversation ID từ phản hồi API (dùng để duy trì ngữ cảnh chat)
  const setConversationIdFromApi = useCallback((id) => {
    setConversationId(id || '')
  }, [])

  // Đối tượng value chứa tất cả state và hàm cần chia sẻ cho các component con
  const value = {
    adminUser,                    // Thông tin admin đang đăng nhập (null nếu chưa đăng nhập)
    loginAdmin,                   // Hàm đăng nhập admin
    logoutAdmin,                  // Hàm đăng xuất admin
    modelURL,                     // URL model Teachable Machine hiện tại
    updateModelURL,               // Hàm cập nhật URL model
    products,                     // Danh sách sản phẩm tái chế đã tạo
    addProduct,                   // Hàm thêm sản phẩm mới
    recognitionHistory,           // Lịch sử các lần nhận diện rác
    addRecognition,               // Hàm thêm lần nhận diện mới
    clearRecognitionHistory,      // Hàm xóa toàn bộ lịch sử
    removeRecognition,            // Hàm xóa 1 lần nhận diện
    removeMultipleRecognitions,   // Hàm xóa nhiều lần nhận diện
    conversationId,               // ID hội thoại LLM hiện tại
    setConversationIdFromApi,     // Hàm cập nhật ID hội thoại
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Custom hook để sử dụng AppContext - bắt buộc phải nằm trong AppProvider
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp phải được sử dụng bên trong AppProvider')
  return ctx
}
