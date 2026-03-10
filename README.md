# AI ReBorn - GreenLab 🌱

Ứng dụng web React cho học sinh tiểu học: nhận diện rác bằng Teachable Machine, lấy gợi ý tái chế từ AI, lưu sản phẩm và theo dõi Điểm Xanh.

---

## 📋 Yêu cầu hệ thống

- [Node.js](https://nodejs.org/) phiên bản **18.x** trở lên
- [npm](https://www.npmjs.com/) phiên bản **9.x** trở lên (đi kèm Node.js)
- Trình duyệt hiện đại (Chrome, Edge, Firefox) có hỗ trợ Webcam

> **Kiểm tra phiên bản đã cài:**
> ```bash
> node -v
> npm -v
> ```

---

## 🚀 Hướng dẫn cài đặt

### 1. Clone dự án

```bash
git clone https://github.com/cuongphamduc/AI-ReBorn.git
cd AI-ReBorn
```

### 2. Cài đặt dependencies

```bash
npm install
```

Lệnh này sẽ đọc file `package.json` và tải về tất cả thư viện cần thiết vào thư mục `node_modules/`.

### 3. Cấu hình biến môi trường (.env)

Dự án sử dụng file `.env` để lưu trữ **thông tin nhạy cảm** (API Key, mật khẩu admin). File này **KHÔNG được** đẩy lên Git.

**Bước thực hiện:**

```bash
# Sao chép file mẫu thành file .env
copy .env.example .env
```

> Trên macOS/Linux dùng: `cp .env.example .env`

**Mở file `.env` và điền thông tin thực tế:**

```properties
# API Key cho LLM Chat (Dify / PTIT AI Chat)
VITE_LLM_API_URL=https://aichat.ptit.edu.vn/v1/chat-messages
VITE_LLM_API_KEY=your_api_key_here                # ← Thay bằng API Key thật

# URL mặc định Teachable Machine Model
VITE_DEFAULT_MODEL_URL=https://teachablemachine.withgoogle.com/models/_aLcx-13S/

# Thông tin đăng nhập Admin
VITE_ADMIN_USERNAME=admin                          # ← Tên đăng nhập admin
VITE_ADMIN_PASSWORD=your_secure_password_here      # ← Thay bằng mật khẩu an toàn
```

| Biến | Mô tả |
|------|-------|
| `VITE_LLM_API_URL` | URL endpoint của API LLM (Dify Chat) |
| `VITE_LLM_API_KEY` | API Key xác thực, lấy từ trang quản trị Dify |
| `VITE_DEFAULT_MODEL_URL` | URL model Teachable Machine mặc định (có thể đổi trong trang Admin) |
| `VITE_ADMIN_USERNAME` | Tên đăng nhập trang quản trị |
| `VITE_ADMIN_PASSWORD` | Mật khẩu trang quản trị |

> ⚠️ **Lưu ý bảo mật:** Không bao giờ commit file `.env` lên Git. File `.gitignore` đã được cấu hình để bỏ qua file này.

> 💡 **Cách lấy API Key Dify:** Đăng nhập trang quản trị Dify → vào ứng dụng AI Chat → mục "API Access" → sao chép API Key (dạng `app-xxxx...`).

> 💡 **Cách lấy URL Teachable Machine:** Vào [Teachable Machine](https://teachablemachine.withgoogle.com/) → tạo/mở model → nhấn "Export Model" → chọn tab "Tensorflow.js" → "Upload my model" → sao chép link (dạng `https://teachablemachine.withgoogle.com/models/xxx/`).

### 4. Chạy ứng dụng (chế độ phát triển)

```bash
npm run dev
```

Mở trình duyệt tại địa chỉ hiển thị trong terminal (mặc định: `http://localhost:5173/aireborn/`).

### 5. Build để triển khai (production)

```bash
npm run build
```

Kết quả build sẽ nằm trong thư mục `dist/`. Để xem trước bản build:

```bash
npm run preview
```

---

## 🛠️ Các lệnh npm có sẵn

| Lệnh | Mô tả |
|-------|-------|
| `npm install` | Cài đặt tất cả dependencies từ `package.json` |
| `npm run dev` | Chạy server phát triển (có Hot Reload) |
| `npm run build` | Build ứng dụng cho production vào thư mục `dist/` |
| `npm run preview` | Xem trước bản build production |

---

## 📁 Cấu trúc dự án

```
AI-ReBorn/
├── .env                  # Biến môi trường (KHÔNG commit lên Git!)
├── .env.example          # File mẫu biến môi trường
├── .gitignore            # Danh sách file/thư mục bị Git bỏ qua
├── index.html            # File HTML gốc (load TensorFlow.js từ CDN)
├── package.json          # Cấu hình dự án và danh sách dependencies
├── vite.config.js        # Cấu hình Vite (build tool)
├── tailwind.config.js    # Cấu hình Tailwind CSS
├── postcss.config.js     # Cấu hình PostCSS
├── public/               # File tĩnh (favicon, ...)
└── src/
    ├── main.jsx          # Điểm khởi đầu ứng dụng React
    ├── App.jsx           # Component gốc, định nghĩa routing
    ├── index.css         # CSS toàn cục (Tailwind directives)
    ├── api/
    │   └── llm.js        # Gọi API LLM lấy gợi ý tái chế
    ├── components/
    │   ├── admin/        # Trang quản trị (Login, ModelManager, Statistics)
    │   ├── shared/       # Component dùng chung (Navigation, LoadingSpinner)
    │   └── student/      # Trang học sinh (WasteRecognition, RecycleSuggestion, ...)
    ├── context/
    │   └── AppContext.jsx # React Context quản lý state toàn ứng dụng
    └── utils/
        └── teachableMachine.js # Tải và sử dụng model Teachable Machine
```

---

## ⚙️ Công nghệ sử dụng

| Công nghệ | Phiên bản | Mục đích |
|------------|-----------|----------|
| React | 18.x | Thư viện giao diện người dùng |
| Vite | 5.x | Build tool nhanh cho phát triển |
| Tailwind CSS | 3.x | Framework CSS tiện ích |
| React Router | 6.x | Điều hướng SPA |
| Recharts | 2.x | Biểu đồ thống kê |
| Lucide React | 0.294+ | Bộ icon SVG |
| TensorFlow.js | latest | Chạy model AI trên trình duyệt |
| Teachable Machine | latest | Nhận diện hình ảnh |

---

## ✨ Tính năng

### 🔐 Trang Admin
- Đăng nhập bằng tài khoản cấu hình trong `.env`
- Quản lý URL model Teachable Machine, test model trực tiếp
- Dashboard thống kê: biểu đồ rác theo loại, top 3, số sản phẩm tái chế

### 🎓 Trang Học sinh
1. **Nhận diện rác**: Webcam hoặc upload ảnh → Teachable Machine → kết quả + độ tin cậy
2. **Gợi ý tái chế**: Gọi API LLM → hiển thị tên, mô tả, vật liệu, các bước, lợi ích, lưu ý an toàn
3. **Lưu sản phẩm**: Form tên + loại rác + upload ảnh sản phẩm hoàn thành
4. **Green Dashboard**: Gallery sản phẩm, Điểm Xanh (sản phẩm × 10), timeline hoạt động

---

## ⚠️ Lưu ý

- **Bảo mật:** API Key và mật khẩu admin được lưu trong file `.env`, không hardcode trong mã nguồn.
- **Dữ liệu:** Sản phẩm và lịch sử nhận diện được lưu trong `localStorage` của trình duyệt.
- **Model AI:** Admin cần cấu hình URL model Teachable Machine hợp lệ trước khi học sinh sử dụng tính năng nhận diện.
- **Webcam:** Cần cấp quyền truy cập camera khi trình duyệt yêu cầu. Nếu không có webcam, có thể dùng chế độ "Tải ảnh lên".
