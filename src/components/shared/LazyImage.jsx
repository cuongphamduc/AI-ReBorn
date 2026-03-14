// ============================================
// Component LazyImage - Lazy loading ảnh với placeholder
// Chỉ load ảnh khi xuất hiện trong viewport (Intersection Observer)
// Hiển thị skeleton placeholder trong khi đang tải
// ============================================

import { useState, useRef, useEffect } from 'react'

export default function LazyImage({ 
  src, 
  alt, 
  className = '', 
  placeholderClassName = '',
  fallback = null // Component hiển thị khi không có ảnh
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)

  // Dùng Intersection Observer để detect khi ảnh xuất hiện trong viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect() // Ngừng observe sau khi đã vào viewport
        }
      },
      {
        rootMargin: '100px', // Load trước 100px khi gần tới viewport
        threshold: 0.01
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Nếu không có src hoặc lỗi → hiển thị fallback
  if (!src || hasError) {
    return fallback || (
      <div className={`bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center ${className}`}>
        <div className="w-10 h-10 text-green-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Skeleton placeholder - hiển thị khi ảnh chưa load xong */}
      {!isLoaded && (
        <div className={`absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 animate-pulse ${placeholderClassName}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skeleton-shimmer" />
        </div>
      )}
      
      {/* Chỉ render <img> khi đã vào viewport */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  )
}
