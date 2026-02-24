// ============================================
// Module tương tác với Teachable Machine (Google)
// Teachable Machine là công cụ tạo model AI nhận diện ảnh không cần code
// Module này load model từ URL và thực hiện dự đoán (predict) trên ảnh
// Sử dụng thư viện tmImage từ CDN (đã load trong index.html)
// ============================================

/**
 * Load model Teachable Machine từ URL
 * URL format: https://teachablemachine.withgoogle.com/models/[MODEL_ID]/
 * Cần 2 file: model.json (cấu trúc model) và metadata.json (thông tin các class)
 * @param {string} modelURL - URL của model Teachable Machine
 * @returns {Promise<object>} - Đối tượng model đã load, sẵn sàng để predict
 */
export async function loadTeachableModel(modelURL) {
  // Đợi thư viện tmImage từ CDN load xong (được import trong index.html)
  if (!window.tmImage) {
    await new Promise((resolve) => {
      const check = setInterval(() => {
        if (window.tmImage) {
          clearInterval(check)
          resolve()
        }
      }, 100)
    })
  }
  
  // Chuẩn hóa URL và tạo đường dẫn đến file model.json và metadata.json
  const base = modelURL.endsWith('/') ? modelURL : modelURL + '/'
  const modelJson = base + 'model.json'
  const metadataJson = base + 'metadata.json'
  
  // Load model từ server Teachable Machine
  const model = await window.tmImage.load(modelJson, metadataJson)
  
  // Log thông tin model để debug: số lượng class và tên các class
  if (model && model.getTotalClasses) {
    const totalClasses = model.getTotalClasses()
    console.log('Model loaded. Total classes:', totalClasses)
    // Lấy class names từ metadata nếu có
    try {
      const metadataResponse = await fetch(metadataJson)
      const metadata = await metadataResponse.json()
      if (metadata.labels) {
        console.log('Model classes:', metadata.labels)
      }
    } catch (e) {
      console.warn('Could not fetch metadata:', e)
    }
  }
  
  return model
}

/**
 * Dự đoán loại rác từ ảnh (img, video frame, hoặc canvas)
 * Model sẽ trả về xác suất cho từng class (loại rác) đã được huấn luyện
 * @param {object} model - Model Teachable Machine đã load
 * @param {HTMLElement} imageElement - Phần tử ảnh (img, video, canvas) cần nhận diện
 * @returns {Promise<{ top: object, predictions: Array }>} - Kết quả top 1 và toàn bộ predictions
 */
export async function predictImage(model, imageElement) {
  // Gọi model.predict() để nhận diện ảnh - trả về mảng predictions cho tất cả class
  const predictions = await model.predict(imageElement)
  
  // Lấy danh sách tên class hợp lệ từ kết quả predictions
  let validClasses = []
  try {
    const totalClasses = model.getTotalClasses()
    // Lấy tên các class từ kết quả predictions (mỗi prediction có thuộc tính className)
    validClasses = predictions.map(p => p.className)
  } catch (e) {
    console.warn('Không thể lấy danh sách class từ model')
  }
  
  // Tìm prediction có xác suất cao nhất (top 1)
  const top = predictions.reduce((prev, current) =>
    prev.probability > current.probability ? prev : current
  )
  
  // Cảnh báo nếu class name không nằm trong danh sách hợp lệ (có thể model đã thay đổi)
  if (top.className && validClasses.length > 0 && !validClasses.includes(top.className)) {
    console.warn(`⚠️ Class "${top.className}" không có trong danh sách classes của model!`)
    console.warn('Valid classes:', validClasses)
  }
  
  return { top, predictions }
}
