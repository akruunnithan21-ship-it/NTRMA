import { forwardRef } from 'react'

const TextArea = forwardRef(({
  label,
  help,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-[11px] tracking-[2px] font-medium text-text-secondary uppercase">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`
          w-full px-4 py-3 rounded-2xl min-h-[100px] resize-y
          bg-white/40 border transition-all duration-200
          text-sm text-text-primary placeholder:text-text-muted
          backdrop-blur-sm font-[inherit]
          focus:outline-none focus:bg-white/60
          ${error 
            ? 'border-pink-300 focus:border-pink-400 focus:shadow-[0_0_0_3px_rgba(231,1,70,0.08)]' 
            : 'border-black/10 focus:border-pink-300 focus:shadow-[0_0_0_3px_rgba(231,1,70,0.06)]'}
        `}
        {...props}
      />
      {help && <p className="text-[11px] text-text-muted tracking-wide">{help}</p>}
      {error && <p className="text-[11px] text-pink-500 tracking-wide">{error}</p>}
    </div>
  )
})

TextArea.displayName = 'TextArea'
export default TextArea
