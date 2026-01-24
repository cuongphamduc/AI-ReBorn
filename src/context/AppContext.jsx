import { createContext, useContext, useState, useCallback } from 'react'

// Giá trị mặc định cho Model URL (Teachable Machine)
const DEFAULT_MODEL_URL = 'https://teachablemachine.withgoogle.com/models/i8CfIt9Xj/'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // Admin: thông tin đăng nhập (chỉ lưu trong state)
  const [adminUser, setAdminUser] = useState(null)

  // Model Teachable Machine
  const [modelURL, setModelURL] = useState(DEFAULT_MODEL_URL)

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
