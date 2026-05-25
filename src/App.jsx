import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Toast from './components/ui/Toast'
import Splash from './components/ui/Splash'
import LoginGate from './components/ui/LoginGate'
import Dashboard from './pages/Dashboard'
import RmaList from './pages/RmaList'
import RmaNew from './pages/RmaNew'
import RmaDetail from './pages/RmaDetail'
import Rack from './pages/Rack'
import Service from './pages/Service'
import ServiceNew from './pages/ServiceNew'
import ServiceDetail from './pages/ServiceDetail'
import OnsiteNew from './pages/OnsiteNew'
import OnsiteDetail from './pages/OnsiteDetail'
import RemoteNew from './pages/RemoteNew'
import RemoteDetail from './pages/RemoteDetail'
import Warranty from './pages/Warranty'
import Settings from './pages/Settings'
import Account from './pages/Account'
import useThemeStore from './store/useThemeStore'
import useAuthStore from './store/useAuthStore'

function RmaGuard({ children }) {
  return <LoginGate>{children}</LoginGate>
}

export default function App() {
  const initTheme = useThemeStore(s => s.initTheme)
  const initAuth = useAuthStore(s => s.init)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => { initTheme(); initAuth() }, [])

  return (
    <>
      {showSplash && <Splash onFinish={() => setShowSplash(false)} />}
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rma" element={<RmaGuard><RmaList /></RmaGuard>} />
          <Route path="/rma/new" element={<RmaGuard><RmaNew /></RmaGuard>} />
          <Route path="/rma/:id" element={<RmaGuard><RmaDetail /></RmaGuard>} />
          <Route path="/rack" element={<Rack />} />
          <Route path="/service" element={<Service />} />
          <Route path="/service/new" element={<ServiceNew />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/onsite/new" element={<OnsiteNew />} />
          <Route path="/onsite/:id" element={<OnsiteDetail />} />
          <Route path="/remote/new" element={<RemoteNew />} />
          <Route path="/remote/:id" element={<RemoteDetail />} />
          <Route path="/warranty" element={<Warranty />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </Layout>
      <Toast />
    </>
  )
}
