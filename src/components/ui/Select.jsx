import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'

export default function Select({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const btnRef = useRef(null)
  const dropRef = useRef(null)
  const [dropdownStyle, setDropdownStyle] = useState({})

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target) && 
          dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const dropUp = spaceBelow < 250

      setDropdownStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
        ...(dropUp 
          ? { bottom: window.innerHeight - rect.top + 8 }
          : { top: rect.bottom + 8 }
        ),
      })
    }
  }, [open])

  const selectedLabel = options.find(o => 
    (typeof o === 'string' ? o : o.value) === value
  )
  const displayText = selectedLabel 
    ? (typeof selectedLabel === 'string' ? selectedLabel : selectedLabel.label)
    : placeholder

  return (
    <div className={`flex flex-col gap-1.5 ${className}`} ref={ref}>
      {label && (
        <label className="text-[11px] tracking-[2px] font-medium text-text-secondary uppercase">
          {label}
        </label>
      )}
      <button
        type="button"
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className={`
          w-full flex items-center justify-between px-4 py-3 rounded-2xl
          bg-white/40 border border-black/10 transition-all duration-200
          text-sm text-left backdrop-blur-sm
          hover:bg-white/50
          ${open ? 'border-pink-200 shadow-[0_0_0_3px_rgba(231,1,70,0.06)] bg-white/60' : ''}
          ${!value ? 'text-text-muted' : 'text-text-primary'}
        `}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown
          size={16}
          className={`text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            ref={dropRef}
            style={dropdownStyle}
            className="bg-white border border-black/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] max-h-[240px] overflow-y-auto overscroll-contain"
            onTouchMove={e => e.stopPropagation()}
          >
            <div className="p-2 space-y-0.5">
              {placeholder && (
                <button
                  type="button"
                  onClick={() => { onChange(''); setOpen(false) }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-text-muted hover:bg-pink-50 transition-colors"
                >
                  {placeholder}
                </button>
              )}
              {options.map((opt) => {
                const optValue = typeof opt === 'string' ? opt : opt.value
                const optLabel = typeof opt === 'string' ? opt : opt.label
                const isSelected = optValue === value
                return (
                  <button
                    type="button"
                    key={optValue}
                    onClick={() => { onChange(optValue); setOpen(false) }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors
                      ${isSelected 
                        ? 'bg-pink-50 text-pink-500 font-medium' 
                        : 'text-text-primary hover:bg-black/[0.02]'}
                    `}
                  >
                    <span>{optLabel}</span>
                    {isSelected && <Check size={14} className="text-pink-500" />}
                  </button>
                )
              })}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
