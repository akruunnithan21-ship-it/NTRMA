import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-3 rounded-full
          bg-white/50 border border-white/60
          text-sm text-text-primary placeholder:text-text-muted
          backdrop-blur-sm
          focus:outline-none focus:border-pink-200 focus:bg-white/70
          focus:shadow-[0_0_0_3px_rgba(231,1,70,0.06)]
          transition-all duration-200"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-pink-500 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
