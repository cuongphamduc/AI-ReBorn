// ============================================
// Component Loading Spinner - Hiển thị animation khi đang tải dữ liệu
// Hỗ trợ 3 kích thước: sm (nhỏ), md (trung bình), lg (lớn)
// Thiết kế mới: hiệu ứng xanh lá với pulse ring
// ============================================

import { Leaf } from 'lucide-react'

export default function LoadingSpinner({ size = 'md', label }) {
  // Xác định kích thước dựa trên props
  const sizes = {
    sm: { container: 'w-8 h-8', icon: 'w-4 h-4', ring: 'w-10 h-10' },
    md: { container: 'w-12 h-12', icon: 'w-6 h-6', ring: 'w-14 h-14' },
    lg: { container: 'w-16 h-16', icon: 'w-8 h-8', ring: 'w-20 h-20' },
  }
  const s = sizes[size] || sizes.md

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 animate-fade-in">
      <div className="relative">
        {/* Vòng tròn pulse bên ngoài */}
        <div className={`absolute inset-0 ${s.ring} -m-1 rounded-full bg-green-400/20 pulse-ring`} />
        {/* Vòng tròn xoay */}
        <div className={`${s.container} rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-green-500/30`}>
          <Leaf className={`${s.icon} text-white animate-spin`} style={{ animationDuration: '2s' }} />
        </div>
      </div>
      {label && (
        <p className="text-green-700 font-medium text-center animate-pulse-slow">{label}</p>
      )}
    </div>
  )
}
