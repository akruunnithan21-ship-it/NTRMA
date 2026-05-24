import { Menu } from 'lucide-react'

export default function TopBar({ title, subtitle, onMenuClick }) {
  return (
    <header className="sticky top-0 z-40 px-4 pt-4 pb-3">
      <div className="glass-card-static flex items-center gap-3 px-4 py-3">
        <button
          onClick={onMenuClick}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-pink-50 transition-colors"
          aria-label="Menu"
        >
          <Menu size={20} className="text-text-primary" />
        </button>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img
            src="/assets/logo.svg"
            alt="Neo Tokyo"
            className="w-8 h-8 drop-shadow-[0_0_8px_rgba(231,1,70,0.4)]"
          />
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-wider text-text-primary truncate">
              {title || 'NEO TOKYO'}
            </h1>
            {subtitle && (
              <p className="text-[10px] tracking-[3px] text-text-muted uppercase">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
