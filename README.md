# AI ReBorn - GreenLab

Ứng dụng web React cho học sinh tiểu học: nhận diện rác bằng Teachable Machine, lấy gợi ý tái chế từ AI, lưu sản phẩm và theo dõi Điểm Xanh.

## Cài đặt

```bash
npm install
npm run dev
```

## Công nghệ

- React 18, Vite
- Tailwind CSS, Lucide React, Recharts
- @tensorflow/tfjs, @teachablemachine/image

## Tính năng

### Trang Admin
- Đăng nhập: `admin` / `admin` (lưu trong state, không dùng localStorage)
- Quản lý URL model Teachable Machine, Test model
- Dashboard thống kê: biểu đồ rác theo loại, top 3, số sản phẩm tái chế

### Trang Học sinh
1. **Nhận diện rác**: Webcam hoặc upload ảnh, tích hợp Teachable Machine, hiển thị kết quả + độ tin cậy
2. **Gợi ý tái chế**: Gọi API LLM (aichat.ptit.edu.vn), hiển thị tên, mô tả, vật liệu, các bước, lợi ích, lưu ý an toàn
3. **Lưu sản phẩm**: Form tên + loại rác + upload ảnh, lưu vào state
4. **Green Dashboard**: Gallery sản phẩm, Điểm Xanh (sản phẩm × 10), timeline hoạt động

## Lưu ý

- Không dùng localStorage/sessionStorage; toàn bộ data lưu trong React state.
- Admin cần cấu hình URL model Teachable Machine hợp lệ trước khi học sinh sử dụng nhận diện.
