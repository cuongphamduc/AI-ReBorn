/**
 * Load Teachable Machine model từ URL
 * URL format: https://teachablemachine.withgoogle.com/models/[MODEL_ID]/
 * Sử dụng window.tmImage từ CDN
 */
export async function loadTeachableModel(modelURL) {
  // Đợi tmImage từ CDN load xong
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
  
  const base = modelURL.endsWith('/') ? modelURL : modelURL + '/'
  const modelJson = base + 'model.json'
  const metadataJson = base + 'metadata.json'
  const model = await window.tmImage.load(modelJson, metadataJson)
  
  // Log metadata để debug
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
 * Dự đoán từ phần tử ảnh (img hoặc video frame)
 * Trả về top class và mảng prediction
 * Validate class name với metadata của model
 */
export async function predictImage(model, imageElement) {
  const predictions = await model.predict(imageElement)
  
  // Lấy danh sách class hợp lệ từ model
  let validClasses = []
  try {
    const totalClasses = model.getTotalClasses()
    // Lấy class names từ predictions (chúng đã có className)
    validClasses = predictions.map(p => p.className)
  } catch (e) {
    console.warn('Could not get valid classes from model')
  }
  
  const top = predictions.reduce((prev, current) =>
    prev.probability > current.probability ? prev : current
  )
  
  // Log để debug
  console.log('Predictions:', predictions.map(p => `${p.className}: ${(p.probability * 100).toFixed(1)}%`))
  console.log('Top result:', top.className, `(${(top.probability * 100).toFixed(1)}%)`)
  
  // Cảnh báo nếu class name có vẻ không hợp lệ (có thể là từ model cũ)
  if (top.className && validClasses.length > 0 && !validClasses.includes(top.className)) {
    console.warn(`⚠️ Class "${top.className}" không có trong danh sách classes của model!`)
    console.warn('Valid classes:', validClasses)
  }
  
  return { top, predictions }
}
