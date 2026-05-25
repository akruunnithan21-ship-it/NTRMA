import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Wrench, RotateCcw, Box, Settings, Shield, User } from 'lucide-react'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'
import useAuthStore from '../../store/useAuthStore'

const pageTitles = {
  '/': { title: 'NEO TOKYO', subtitle: 'DASHBOARD' },
  '/rma': { title: 'NEO TOKYO', subtitle: 'RMA / TICKETS' },
  '/rma/new': { title: 'NEO TOKYO', subtitle: 'RMA / NEW ENTRY' },
  '/rack': { title: 'NEO TOKYO', subtitle: 'RACK INVENTORY' },
  '/service': { title: 'NEO TOKYO', subtitle: 'SERVICE' },
  '/service/new': { title: 'NEO TOKYO', subtitle: 'SERVICE / NEW' },
  '/onsite/new': { title: 'NEO TOKYO', subtitle: 'ONSITE / NEW' },
  '/remote/new': { title: 'NEO TOKYO', subtitle: 'REMOTE / NEW' },
  '/warranty': { title: 'NEO TOKYO', subtitle: 'WARRANTY' },
  '/settings': { title: 'NEO TOKYO', subtitle: 'SETTINGS' },
  '/account': { title: 'NEO TOKYO', subtitle: 'ACCOUNT' },
}

const desktopNavItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/service', label: 'Service', icon: Wrench },
  { path: '/rma', label: 'RMA', icon: RotateCcw },
  { path: '/rack', label: 'Rack', icon: Box },
  { path: '/warranty', label: 'Warranty', icon: Shield },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/account', label: 'Account', icon: User },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { displayName, role } = useAuthStore()

  let pageInfo = pageTitles[location.pathname]
  if (!pageInfo) {
    if (location.pathname.startsWith('/rma/')) pageInfo = { title: 'NEO TOKYO', subtitle: 'RMA / TICKET' }
    else if (location.pathname.startsWith('/service/')) pageInfo = { title: 'NEO TOKYO', subtitle: 'SERVICE / TICKET' }
    else if (location.pathname.startsWith('/onsite/')) pageInfo = { title: 'NEO TOKYO', subtitle: 'ONSITE / TICKET' }
    else if (location.pathname.startsWith('/remote/')) pageInfo = { title: 'NEO TOKYO', subtitle: 'REMOTE / TICKET' }
    else pageInfo = { title: 'NEO TOKYO', subtitle: '' }
  }

  function isActive(path) {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen flex">
      {/* Desktop persistent sidebar — hidden on mobile */}
      <aside className="hidden lg:flex w-[260px] shrink-0 h-screen sticky top-0 flex-col border-r border-black/[0.04] bg-white/60 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-5 pt-6 pb-4 border-b border-black/[0.04]">
          <img src="/assets/nt-logo.png" alt="Neo Tokyo" className="w-9 h-9 object-contain" />
          <div>
            <div className="text-sm font-bold tracking-[4px] text-pink-500 font-[family-name:var(--font-heading)]">NEO TOKYO</div>
            <div className="text-[9px] tracking-[3px] text-text-muted">SERVICE / RMA</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {desktopNavItems.map(item => {
            const active = isActive(item.path)
            const Icon = item.icon
            return (
              <button key={item.path} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${active ? 'bg-pink-50 text-pink-500 shadow-[0_4px_16px_rgba(255,79,139,0.08)]' : 'text-text-secondary hover:bg-black/[0.02] hover:text-text-primary'}`}>
                <Icon size={18} strokeWidth={active ? 2.2 : 1.6} />
                <span className="text-[12px] font-medium tracking-wider">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="px-4 py-3 border-t border-black/[0.04]">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center">
              <User size={14} className="text-pink-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium text-text-primary truncate">{displayName || 'Account'}</div>
              <div className="text-[9px] text-text-muted uppercase tracking-wider">{role === 'rma_lead' ? 'RMA Lead' : role === 'viewer' ? 'Viewer' : ''}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar (slide-out) */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 min-h-screen flex flex-col min-w-0">
        {/* TopBar only on mobile */}
        <div className="lg:hidden">
          <TopBar title={pageInfo.title} subtitle={pageInfo.subtitle} onMenuClick={() => setSidebarOpen(true)} />
        </div>

        {/* Desktop top bar — minimal */}
        <header className="hidden lg:flex items-center justify-between px-8 pt-6 pb-2">
          <div>
            <h1 className="text-lg font-bold tracking-wider text-text-primary font-[family-name:var(--font-heading)]">{pageInfo.subtitle || 'DASHBOARD'}</h1>
          </div>
          <div className="text-[10px] tracking-[2px] text-text-muted">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}</div>
        </header>

        <main className="flex-1 px-4 pb-28 lg:px-8 lg:pb-8 max-w-full lg:max-w-[1400px] w-full">
          {children}
        </main>

        {/* BottomNav only on mobile */}
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
