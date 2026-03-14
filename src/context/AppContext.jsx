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
const SEED_VERSION_KEY = 'aireborn_seed_version'
const CURRENT_SEED_VERSION = 3 // Tăng version khi cần force refresh seed data

// ====== DỮ LIỆU MẪU BAN ĐẦU ======
// Seed data hiển thị sẵn trên Dashboard khi người dùng lần đầu mở app
// Đường dẫn ảnh dùng encodeURIComponent để xử lý đúng tên file tiếng Việt
// import.meta.env.BASE_URL tự động lấy base path từ vite.config.js
const imgPath = (filename) => `${import.meta.env.BASE_URL}images/${encodeURIComponent(filename)}`

const SEED_PRODUCTS = [
  {
    id: 'seed-1',
    name: 'Ví đựng bút từ bao bì snack',
    wasteType: 'Bao bì snack',
    image: imgPath('Bao bì snack 1.png'),
    createdAt: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
  },
  {
    id: 'seed-2',
    name: 'Mô hình trực thăng từ bút bi hết mực',
    wasteType: 'Bút bi hết mực',
    image: imgPath('Bút bi hết mực 1.png'),
    createdAt: new Date(Date.now() - 6 * 24 * 3600000).toISOString(),
  },
  {
    id: 'seed-3',
    name: 'Giá đỡ điện thoại từ bút bi hết mực',
    wasteType: 'Bút bi hết mực',
    image: imgPath('Bút bi hết mực 2.png'),
    createdAt: new Date(Date.now() - 6 * 24 * 3600000 + 3600000).toISOString(),
  },
  {
    id: 'seed-4',
    name: 'Chậu cây mini từ bút chì gãy',
    wasteType: 'Bút chì gãy',
    image: imgPath('Bút chì gãy 1.png'),
    createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
  },
  {
    id: 'seed-5',
    name: 'Chậu cây treo từ chai nước ngọt',
    wasteType: 'Chai nước ngọt',
    image: imgPath('Chai nước ngọt 1.png'),
    createdAt: new Date(Date.now() - 4 * 24 * 3600000).toISOString(),
  },
  {
    id: 'seed-6',
    name: 'Ống đựng bút từ chai nước suối',
    wasteType: 'Chai nước suối',
    image: imgPath('Chai nước suối 1.png'),
    createdAt: new Date(Date.now() - 4 * 24 * 3600000 + 3600000).toISOString(),
  },
  {
    id: 'seed-7',
    name: 'Bình tưới cây từ chai nước suối',
    wasteType: 'Chai nước suối',
    image: imgPath('Chai nước suối 2.png'),
    createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
  },
  {
    id: 'seed-8',
    name: 'Hộp ghi chú để bàn từ giấy nháp',
    wasteType: 'Giấy nháp',
    image: imgPath('Giấy nháp 1.png'),
    createdAt: new Date(Date.now() - 3 * 24 * 3600000 + 7200000).toISOString(),
  },
  {
    id: 'seed-9',
    name: 'Flashcard học tập từ giấy nháp',
    wasteType: 'Giấy nháp',
    image: imgPath('Giấy nháp 2.png'),
    createdAt: new Date(Date.now() - 3 * 24 * 3600000 + 10800000).toISOString(),
  },
  {
    id: 'seed-10',
    name: 'Sổ vẽ mini từ giấy nháp',
    wasteType: 'Giấy nháp',
    image: imgPath('Giấy nháp 3.png'),
    createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
  },
  {
    id: 'seed-11',
    name: 'Chậu cây từ hộp sữa giấy',
    wasteType: 'Hộp sữa giấy',
    image: imgPath('Hộp sữa giấy 1.png'),
    createdAt: new Date(Date.now() - 2 * 24 * 3600000 + 3600000).toISOString(),
  },
  {
    id: 'seed-12',
    name: 'Hộp đựng bút từ ly nhựa trà sữa',
    wasteType: 'Ly nhựa trà sữa',
    image: imgPath('Ly nhựa trà sữa.png'),
    createdAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
  },
  {
    id: 'seed-13',
    name: 'Trò chơi toán học từ nắp chai',
    wasteType: 'Nắp chai',
    image: imgPath('Nắp chai 1.png'),
    createdAt: new Date(Date.now() - 1 * 24 * 3600000 + 3600000).toISOString(),
  },
  {
    id: 'seed-14',
    name: 'Dây nhựa tái chế từ túi nilon',
    wasteType: 'Túi nilon',
    image: imgPath('Túi nilon 1.png'),
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'seed-15',
    name: 'Khung ảnh mini từ ống hút',
    wasteType: 'Ống hút',
    image: imgPath('Ống hút 1.png'),
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
]

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
  // Các sản phẩm tái chế đã được người dùng tạo - Load từ localStorage, fallback về seed data
  const [products, setProducts] = useState(() => {
    try {
      // Kiểm tra version seed data - nếu version cũ thì xóa để load lại seed mới
      const savedVersion = localStorage.getItem(SEED_VERSION_KEY)
      if (!savedVersion || parseInt(savedVersion, 10) < CURRENT_SEED_VERSION) {
        localStorage.removeItem(PRODUCTS_STORAGE_KEY)
        localStorage.setItem(SEED_VERSION_KEY, String(CURRENT_SEED_VERSION))
        return SEED_PRODUCTS
      }
      
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY)
      if (!saved) return SEED_PRODUCTS
      const parsed = JSON.parse(saved)
      return parsed
    } catch {
      return SEED_PRODUCTS
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
