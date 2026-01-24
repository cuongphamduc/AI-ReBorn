import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ size = 'md', label }) {
  const sizeClass = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      <Loader2 className={`${sizeClass} animate-spin text-green-600`} />
      {label && <p className="text-green-700 font-medium">{label}</p>}
    </div>
  )
}
