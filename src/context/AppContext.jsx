import { createContext, useContext, useState, useCallback, useEffect } from 'react'

// Giá trị mặc định cho Model URL (Teachable Machine)
const DEFAULT_MODEL_URL = 'https://teachablemachine.withgoogle.com/models/TAk-XTRr3/'
const MODEL_URL_STORAGE_KEY = 'aireborn_model_url'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // Admin: thông tin đăng nhập (chỉ lưu trong state)
  const [adminUser, setAdminUser] = useState(null)

  // Model Teachable Machine - Load từ localStorage hoặc dùng default
  const [modelURL, setModelURL] = useState(() => {
    try {
      const saved = localStorage.getItem(MODEL_URL_STORAGE_KEY)
      return saved || DEFAULT_MODEL_URL
    } catch {
      return DEFAULT_MODEL_URL
    }
  })

  // Danh sách sản phẩm tái chế đã tạo
  const [products, setProducts] = useState([])

  // Lịch sử nhận diện rác (để thống kê)
  const [recognitionHistory, setRecognitionHistory] = useState([])

  // Conversation ID cho API chat LLM
  const [conversationId, setConversationId] = useState('')

  const loginAdmin = useCallback((username, password) => {
    // Đơn giản: cho phép đăng nhập với admin/admin (demo)
    if (username === 'admin' && password === 'admin') {
      setAdminUser({ username })
      return true
    }
    return false
  }, [])

  const logoutAdmin = useCallback(() => {
    setAdminUser(null)
  }, [])

  const updateModelURL = useCallback((url) => {
    const normalized = url.endsWith('/') ? url : url + '/'
    setModelURL(normalized)
    // Lưu vào localStorage để persist
    try {
      localStorage.setItem(MODEL_URL_STORAGE_KEY, normalized)
      console.log('✅ Model URL saved to localStorage:', normalized)
    } catch (err) {
      console.warn('⚠️ Failed to save model URL to localStorage:', err)
    }
  }, [])

  const addRecognition = useCallback((label, confidence, imageUrl = null) => {
    setRecognitionHistory((prev) => [
      ...prev,
      { id: Date.now().toString() + Math.random().toString(36).substr(2, 9), label, confidence, imageUrl, timestamp: new Date().toISOString() },
    ])
  }, [])

  const clearRecognitionHistory = useCallback(() => {
    setRecognitionHistory([])
  }, [])

  const removeRecognition = useCallback((id) => {
    setRecognitionHistory((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const removeMultipleRecognitions = useCallback((ids) => {
    setRecognitionHistory((prev) => prev.filter((item) => !ids.includes(item.id)))
  }, [])

  const addProduct = useCallback((product) => {
    setProducts((prev) => [
      ...prev,
      { ...product, id: Date.now().toString(), createdAt: new Date().toISOString() },
    ])
  }, [])

  const setConversationIdFromApi = useCallback((id) => {
    setConversationId(id || '')
  }, [])

  const value = {
    adminUser,
    loginAdmin,
    logoutAdmin,
    modelURL,
    updateModelURL,
    products,
    addProduct,
    recognitionHistory,
    addRecognition,
    clearRecognitionHistory,
    removeRecognition,
    removeMultipleRecognitions,
    conversationId,
    setConversationIdFromApi,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
