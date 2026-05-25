import { useLocation, useNavigate } from 'react-router-dom'
import { X, Home, Wrench, Shield, Settings, User } from 'lucide-react'
import useAuthStore from '../../store/useAuthStore'

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/service', label: 'Service', icon: Wrench, badge: 'SOON' },
  { path: '/warranty', label: 'Warranty', icon: Shield, badge: 'SOON' },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ open, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { displayName, role } = useAuthStore()

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
      <div
        className={`fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside className={`fixed top-0 left-0 bottom-0 w-[280px] z-[65] transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full bg-white/80 backdrop-blur-xl border-r border-white/60 shadow-[20px_0_60px_rgba(0,0,0,0.08)] flex flex-col">
          <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-black/[0.04]">
            <div className="flex items-center gap-3">
              <img src="/assets/nt-logo.png" alt="Neo Tokyo" className="w-10 h-10 object-contain" />
              <div>
                <div className="text-sm font-bold tracking-[4px] text-pink-500 font-[family-name:var(--font-heading)]">NEO TOKYO</div>
                <div className="text-[9px] tracking-[3px] text-text-muted">SERVICE / RMA</div>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-pink-50 transition-colors">
              <X size={18} className="text-text-secondary" />
            </button>
          </div>

          {/* Account section */}
          <button onClick={() => handleNav('/account')} className={`mx-3 mt-4 mb-2 flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${location.pathname === '/account' ? 'bg-pink-50 text-pink-500' : 'text-text-secondary hover:bg-black/[0.02]'}`}>
            <div className="w-10 h-10 rounded-full bg-pink-50 border-2 border-pink-200 flex items-center justify-center overflow-hidden">
              <User size={20} className="text-pink-400" />
            </div>
            <div className="text-left">
              <span className="text-[13px] font-medium tracking-wider block">{displayName || 'Account'}</span>
              <span className="text-[9px] tracking-wider text-text-muted uppercase">{role === 'rma_lead' ? 'RMA Lead' : role === 'viewer' ? 'Viewer' : 'Not logged in'}</span>
            </div>
          </button>

          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {navItems.map(item => {
              const active = isActive(item.path)
              const Icon = item.icon
              return (
                <button key={item.path} onClick={() => handleNav(item.path)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${active ? 'bg-pink-50 text-pink-500 shadow-[0_4px_16px_rgba(255,79,139,0.1)]' : 'text-text-secondary hover:bg-black/[0.02] hover:text-text-primary'}`}>
                  <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
                  <span className="text-[13px] font-medium tracking-wider">{item.label}</span>
                  {item.badge && <span className="ml-auto text-[9px] tracking-wider px-2 py-0.5 rounded-full bg-ice-200 text-ice-500 font-medium">{item.badge}</span>}
                </button>
              )
            })}
          </nav>

          <div className="px-5 py-4 border-t border-black/[0.04]">
            <p className="text-[10px] tracking-[3px] text-text-muted">NEO TOKYO - KOCHI</p>
          </div>
        </div>
      </aside>
    </>
  )
}
