// ============================================
// Script nén ảnh trong public/images để giảm dung lượng
// Chạy: npm run compress-images (cần thêm script vào package.json)
// Hoặc: node scripts/compress-images.js
// ============================================

const fs = require('fs')
const path = require('path')

// Kiểm tra xem sharp đã được cài chưa
let sharp
try {
  sharp = require('sharp')
} catch (e) {
  console.log('📦 Cần cài đặt sharp để nén ảnh:')
  console.log('   npm install sharp --save-dev')
  console.log('')
  console.log('💡 Hoặc bạn có thể nén ảnh thủ công bằng các công cụ online:')
  console.log('   - https://tinypng.com')
  console.log('   - https://squoosh.app')
  console.log('   - https://compressor.io')
  process.exit(0)
}

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images')
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images-optimized')

// Cấu hình nén
const CONFIG = {
  quality: 80,      // Chất lượng JPEG/WebP (0-100)
  maxWidth: 800,    // Chiều rộng tối đa (px)
  maxHeight: 800,   // Chiều cao tối đa (px)
}

async function compressImages() {
  // Tạo thư mục output nếu chưa có
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const files = fs.readdirSync(IMAGES_DIR).filter(f => 
    /\.(png|jpg|jpeg|webp)$/i.test(f)
  )

  console.log(`🖼️  Tìm thấy ${files.length} ảnh cần xử lý...`)
  console.log('')

  let totalOriginal = 0
  let totalCompressed = 0

  for (const file of files) {
    const inputPath = path.join(IMAGES_DIR, file)
    const outputPath = path.join(OUTPUT_DIR, file.replace(/\.(png|jpg|jpeg)$/i, '.webp'))
    
    const originalSize = fs.statSync(inputPath).size

    try {
      await sharp(inputPath)
        .resize(CONFIG.maxWidth, CONFIG.maxHeight, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .webp({ quality: CONFIG.quality })
        .toFile(outputPath)

      const compressedSize = fs.statSync(outputPath).size
      const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1)

      totalOriginal += originalSize
      totalCompressed += compressedSize

      console.log(`✅ ${file}`)
      console.log(`   ${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB (-${reduction}%)`)
    } catch (err) {
      console.log(`❌ ${file}: ${err.message}`)
    }
  }

  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📊 Tổng kết:`)
  console.log(`   Trước: ${(totalOriginal / 1024 / 1024).toFixed(2)}MB`)
  console.log(`   Sau:   ${(totalCompressed / 1024 / 1024).toFixed(2)}MB`)
  console.log(`   Giảm:  ${((1 - totalCompressed / totalOriginal) * 100).toFixed(1)}%`)
  console.log('')
  console.log(`📁 Ảnh đã nén được lưu tại: ${OUTPUT_DIR}`)
  console.log('')
  console.log('💡 Để sử dụng ảnh đã nén:')
  console.log('   1. Backup thư mục public/images')
  console.log('   2. Copy nội dung public/images-optimized vào public/images')
  console.log('   3. Cập nhật đường dẫn trong code (đổi .png → .webp)')
}

compressImages().catch(console.error)
