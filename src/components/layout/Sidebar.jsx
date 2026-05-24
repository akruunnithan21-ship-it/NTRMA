import { useLocation, useNavigate } from 'react-router-dom'
import { X, Home, RotateCcw, Box, Wrench, Shield, Settings } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/rma', label: 'RMA Tickets', icon: RotateCcw },
  { path: '/rack', label: 'Rack Inventory', icon: Box },
  { path: '/service', label: 'Service', icon: Wrench, badge: 'SOON' },
  { path: '/warranty', label: 'Warranty', icon: Shield, badge: 'SOON' },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ open, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()

  function isActive(path) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  function handleNav(path) {
    navigate(path)
    onClose()
  }

  return (
    <>
      {/* Scrim */}
      <div
        className={`fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[280px] z-[65] transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full bg-white/80 backdrop-blur-xl border-r border-white/60 shadow-[20px_0_60px_rgba(0,0,0,0.08)] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-black/[0.04]">
            <div className="flex items-center gap-3">
              <img
                src="/assets/logo.svg"
                alt="Neo Tokyo"
                className="w-10 h-10 drop-shadow-[0_0_12px_rgba(231,1,70,0.4)]"
              />
              <div>
                <div className="text-sm font-bold tracking-[4px] text-pink-500">NEO TOKYO</div>
                <div className="text-[9px] tracking-[3px] text-text-muted">SERVICE / RMA</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-pink-50 transition-colors"
            >
              <X size={18} className="text-text-secondary" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map(item => {
              const active = isActive(item.path)
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200
                    ${active
                      ? 'bg-pink-50 text-pink-500 shadow-[0_4px_16px_rgba(255,79,139,0.1)]'
                      : 'text-text-secondary hover:bg-black/[0.02] hover:text-text-primary'}
                  `}
                >
                  <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
                  <span className="text-[13px] font-medium tracking-wider">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[9px] tracking-wider px-2 py-0.5 rounded-full bg-ice-200 text-ice-500 font-medium">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-black/[0.04]">
            <p className="text-[10px] tracking-[3px] text-text-muted">
              NEO TOKYO - KOCHI
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
