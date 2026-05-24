import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Toast from './components/ui/Toast'
import Dashboard from './pages/Dashboard'
import RmaList from './pages/RmaList'
import RmaNew from './pages/RmaNew'
import RmaDetail from './pages/RmaDetail'
import Rack from './pages/Rack'
import Service from './pages/Service'
import Warranty from './pages/Warranty'
import Settings from './pages/Settings'

export default function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rma" element={<RmaList />} />
          <Route path="/rma/new" element={<RmaNew />} />
          <Route path="/rma/:id" element={<RmaDetail />} />
          <Route path="/rack" element={<Rack />} />
          <Route path="/service" element={<Service />} />
          <Route path="/warranty" element={<Warranty />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
      <Toast />
    </>
  )
}
