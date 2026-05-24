import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Wrench, RotateCcw, Box, Settings } from 'lucide-react'
import useTicketStore from '../../store/useTicketStore'

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/service', label: 'Service', icon: Wrench },
  { path: '/rma', label: 'RMA', icon: RotateCcw, showBadge: true },
  { path: '/rack', label: 'Rack', icon: Box },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { tickets } = useTicketStore()

  const openCount = tickets.filter(t => ['Pending', 'Open'].includes(t.status)).length

  function isActive(path) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 pointer-events-none">
      <div className="glass-card-static max-w-md mx-auto flex items-center justify-around px-1 py-2 pointer-events-auto">
        {navItems.map(item => {
          const active = isActive(item.path)
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-300
                ${active 
                  ? 'bg-pink-50 text-pink-500 shadow-[0_4px_16px_rgba(255,79,139,0.15)]' 
                  : 'text-text-muted hover:text-text-secondary'}
              `}
            >
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              <span className={`text-[9px] tracking-wider font-medium ${active ? 'text-pink-500' : ''}`}>
                {item.label}
              </span>
              {item.showBadge && openCount > 0 && (
                <span className="absolute -top-0.5 right-1 min-w-[14px] h-3.5 px-1 flex items-center justify-center rounded-full bg-pink-500 text-white text-[8px] font-bold shadow-[0_2px_8px_rgba(231,1,70,0.4)]">
                  {openCount > 99 ? '99+' : openCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
