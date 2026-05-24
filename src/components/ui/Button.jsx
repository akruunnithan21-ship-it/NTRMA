export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  full = false,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium tracking-wider transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-text-primary text-white hover:bg-text-primary/90 shadow-[0_6px_24px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.18)]',
    pink: 'bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-[0_8px_24px_rgba(231,1,70,0.25)] hover:shadow-[0_12px_32px_rgba(231,1,70,0.35)]',
    ghost: 'bg-white/50 border border-white/80 text-text-primary hover:bg-white/70 hover:border-pink-200 backdrop-blur-sm',
    danger: 'bg-pink-50 text-pink-500 border border-pink-200 hover:bg-pink-100',
    icon: 'bg-white/50 border border-white/80 text-text-secondary hover:text-pink-500 hover:border-pink-200 backdrop-blur-sm',
  }

  const sizes = {
    sm: 'text-[11px] px-3 py-2 rounded-xl',
    md: 'text-[12px] px-5 py-3 rounded-2xl',
    lg: 'text-[13px] px-6 py-4 rounded-2xl',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
