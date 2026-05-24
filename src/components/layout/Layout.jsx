import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'

const pageTitles = {
  '/': { title: 'NEO TOKYO', subtitle: 'DASHBOARD' },
  '/rma': { title: 'NEO TOKYO', subtitle: 'RMA / TICKETS' },
  '/rma/new': { title: 'NEO TOKYO', subtitle: 'RMA / NEW ENTRY' },
  '/rack': { title: 'NEO TOKYO', subtitle: 'RACK INVENTORY' },
  '/service': { title: 'NEO TOKYO', subtitle: 'SERVICE' },
  '/warranty': { title: 'NEO TOKYO', subtitle: 'WARRANTY' },
  '/settings': { title: 'NEO TOKYO', subtitle: 'SETTINGS' },
}

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Match page title
  let pageInfo = pageTitles[location.pathname]
  if (!pageInfo) {
    if (location.pathname.startsWith('/rma/')) {
      pageInfo = { title: 'NEO TOKYO', subtitle: 'RMA / TICKET' }
    } else {
      pageInfo = { title: 'NEO TOKYO', subtitle: '' }
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <TopBar
        title={pageInfo.title}
        subtitle={pageInfo.subtitle}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <main className="flex-1 px-4 pb-28 max-w-2xl mx-auto w-full">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
