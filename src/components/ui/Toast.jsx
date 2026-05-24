import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

let toastTimeout = null
let setToastGlobal = null

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

export function showToast(message, type = 'success', duration = 2500) {
  if (setToastGlobal) {
    setToastGlobal({ message, type, visible: true })
    clearTimeout(toastTimeout)
    toastTimeout = setTimeout(() => {
      setToastGlobal(prev => ({ ...prev, visible: false }))
    }, duration)
  }
}

export default function Toast() {
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false })
  
  useEffect(() => {
    setToastGlobal = setToast
    return () => { setToastGlobal = null }
  }, [])

  const Icon = icons[toast.type] || icons.info

  return (
    <div className={`
      fixed bottom-24 left-1/2 -translate-x-1/2 z-[200]
      transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]
      ${toast.visible 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-4 pointer-events-none'}
    `}>
      <div className="flex items-center gap-3 px-5 py-3 rounded-full
        bg-white/90 backdrop-blur-xl border border-white/80
        shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
        <Icon size={16} className={`
          ${toast.type === 'success' ? 'text-emerald-500' : ''}
          ${toast.type === 'error' ? 'text-pink-500' : ''}
          ${toast.type === 'info' ? 'text-sky-500' : ''}
        `} />
        <span className="text-[12px] tracking-wider font-medium text-text-primary">
          {toast.message}
        </span>
        <button
          onClick={() => setToast(p => ({ ...p, visible: false }))}
          className="ml-1 text-text-muted hover:text-text-secondary"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
