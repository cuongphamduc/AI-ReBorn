# ============================================
# Script Python nén ảnh trong public/images
# Giảm dung lượng ảnh để tăng tốc độ load trang
# 
# Cài đặt: pip install Pillow
# Chạy: python compress_images.py
# ============================================

from PIL import Image
import os
from pathlib import Path

# Cấu hình
INPUT_DIR = Path(__file__).parent / "public" / "images"
OUTPUT_DIR = Path(__file__).parent / "public" / "images-compressed"
MAX_SIZE = (800, 800)  # Kích thước tối đa (width, height)
QUALITY = 85  # Chất lượng ảnh (1-100, cao hơn = chất lượng tốt hơn nhưng file lớn hơn)

def compress_image(input_path, output_path, max_size=MAX_SIZE, quality=QUALITY):
    """Nén và resize một ảnh"""
    try:
        with Image.open(input_path) as img:
            # Chuyển sang RGB nếu là RGBA (PNG với transparency)
            if img.mode in ('RGBA', 'P'):
                # Tạo background trắng cho ảnh có transparency
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize nếu ảnh lớn hơn max_size
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Lưu với chất lượng đã chỉ định
            img.save(output_path, 'JPEG', quality=quality, optimize=True)
            
            return True
    except Exception as e:
        print(f"  ❌ Lỗi: {e}")
        return False

def get_file_size_kb(path):
    """Lấy kích thước file theo KB"""
    return os.path.getsize(path) / 1024

def main():
    print("=" * 50)
    print("🖼️  SCRIPT NÉN ẢNH CHO AI-REBORN")
    print("=" * 50)
    print()
    
    # Kiểm tra thư mục input
    if not INPUT_DIR.exists():
        print(f"❌ Không tìm thấy thư mục: {INPUT_DIR}")
        print("   Hãy chạy script này từ thư mục gốc của project.")
        return
    
    # Tạo thư mục output
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Lấy danh sách file ảnh
    image_extensions = {'.png', '.jpg', '.jpeg', '.webp', '.bmp'}
    images = [f for f in INPUT_DIR.iterdir() 
              if f.suffix.lower() in image_extensions]
    
    if not images:
        print("⚠️  Không tìm thấy ảnh nào trong thư mục input.")
        return
    
    print(f"📁 Input:  {INPUT_DIR}")
    print(f"📁 Output: {OUTPUT_DIR}")
    print(f"📐 Max size: {MAX_SIZE[0]}x{MAX_SIZE[1]}px")
    print(f"🎨 Quality: {QUALITY}%")
    print()
    print(f"🔍 Tìm thấy {len(images)} ảnh cần xử lý...")
    print("-" * 50)
    
    total_original = 0
    total_compressed = 0
    success_count = 0
    
    for img_path in images:
        # Đổi extension sang .jpg
        output_name = img_path.stem + ".jpg"
        output_path = OUTPUT_DIR / output_name
        
        original_size = get_file_size_kb(img_path)
        total_original += original_size
        
        print(f"\n📷 {img_path.name}")
        print(f"   Gốc: {original_size:.1f} KB")
        
        if compress_image(img_path, output_path):
            compressed_size = get_file_size_kb(output_path)
            total_compressed += compressed_size
            reduction = ((original_size - compressed_size) / original_size) * 100
            
            print(f"   Nén:  {compressed_size:.1f} KB")
            print(f"   ✅ Giảm {reduction:.1f}%")
            success_count += 1
        else:
            total_compressed += original_size
    
    # Tổng kết
    print()
    print("=" * 50)
    print("📊 TỔNG KẾT")
    print("=" * 50)
    print(f"✅ Đã nén thành công: {success_count}/{len(images)} ảnh")
    print(f"📦 Dung lượng gốc:    {total_original/1024:.2f} MB")
    print(f"📦 Dung lượng mới:    {total_compressed/1024:.2f} MB")
    
    if total_original > 0:
        total_reduction = ((total_original - total_compressed) / total_original) * 100
        print(f"🚀 Giảm tổng cộng:    {total_reduction:.1f}%")
    
    print()
    print("💡 HƯỚNG DẪN SỬ DỤNG:")
    print("-" * 50)
    print("1. Backup thư mục public/images (đề phòng)")
    print("2. Copy các file từ public/images-compressed")
    print("   vào public/images (ghi đè)")
    print("3. Cập nhật đường dẫn trong AppContext.jsx:")
    print("   Đổi '.png' thành '.jpg' trong hàm imgPath")
    print()
    print(f"📁 Ảnh đã nén: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
