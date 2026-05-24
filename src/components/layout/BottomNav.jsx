import { useLocation, useNavigate } from 'react-router-dom'
import { Home, RotateCcw, Box, Settings } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/rma', label: 'RMA', icon: RotateCcw },
  { path: '/rack', label: 'Rack', icon: Box },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  function isActive(path) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 pointer-events-none">
      <div className="glass-card-static max-w-md mx-auto flex items-center justify-around px-2 py-2 pointer-events-auto">
        {navItems.map(item => {
          const active = isActive(item.path)
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300
                ${active 
                  ? 'bg-pink-50 text-pink-500 shadow-[0_4px_16px_rgba(255,79,139,0.15)]' 
                  : 'text-text-muted hover:text-text-secondary'}
              `}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span className={`text-[10px] tracking-wider font-medium ${active ? 'text-pink-500' : ''}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
