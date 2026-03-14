// Script đổi tên file ảnh sang ASCII để tránh lỗi encoding trên các hệ thống
const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, 'public', 'images')

const renameMap = {
  'Bao bì snack 1.png':       'waste-bao-bi-snack-1.png',
  'Bút bi hết mực 1.png':     'waste-but-bi-het-muc-1.png',
  'Bút bi hết mực 2.png':     'waste-but-bi-het-muc-2.png',
  'Bút chì gãy 1.png':        'waste-but-chi-gay-1.png',
  'Chai nước ngọt 1.png':     'waste-chai-nuoc-ngot-1.png',
  'Chai nước suối 1.png':     'waste-chai-nuoc-suoi-1.png',
  'Chai nước suối 2.png':     'waste-chai-nuoc-suoi-2.png',
  'Giấy nháp 1.png':          'waste-giay-nhap-1.png',
  'Giấy nháp 2.png':          'waste-giay-nhap-2.png',
  'Giấy nháp 3.png':          'waste-giay-nhap-3.png',
  'Hộp sữa giấy 1.png':       'waste-hop-sua-giay-1.png',
  'Ly nhựa trà sữa.png':      'waste-ly-nhua-tra-sua.png',
  'Nắp chai 1.png':            'waste-nap-chai-1.png',
  'Túi nilon 1.png':           'waste-tui-nilon-1.png',
  'Ống hút 1.png':             'waste-ong-hut-1.png',
}

const files = fs.readdirSync(dir)
console.log('Files found:', files)

let renamed = 0
for (const [oldName, newName] of Object.entries(renameMap)) {
  // Tìm file khớp (so sánh không phân biệt hoa thường để an toàn)
  const match = files.find(f => f.toLowerCase() === oldName.toLowerCase())
  if (match) {
    fs.renameSync(path.join(dir, match), path.join(dir, newName))
    console.log(`✅ Renamed: ${match} → ${newName}`)
    renamed++
  } else {
    console.log(`⚠️  Not found: ${oldName}`)
  }
}

console.log(`\nDone: ${renamed}/${Object.keys(renameMap).length} files renamed.`)
console.log('Files after rename:', fs.readdirSync(dir))
