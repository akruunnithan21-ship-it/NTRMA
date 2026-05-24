import { useState } from 'react'
import { Lock, LogIn, User } from 'lucide-react'
import GlassCard from './GlassCard'
import Input from './Input'
import Button from './Button'
import { showToast } from './Toast'
import useAuthStore from '../../store/useAuthStore'
import { vibrate } from '../../lib/haptics'

export default function LoginGate({ children }) {
  const { user, loading, login, displayName, role, logout } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-pink-300 border-t-pink-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    return (
      <>
        {/* User info bar */}
        <div className="flex items-center justify-between px-1 mb-4 animate-fade-up">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center">
              <User size={14} className="text-pink-500" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-text-primary">{displayName}</span>
              <span className="text-[9px] text-text-muted ml-2 uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-pink-50 border border-pink-200 text-pink-500">
                {role === 'rma_lead' ? 'RMA LEAD' : 'VIEWER'}
              </span>
            </div>
          </div>
          <button onClick={() => { logout(); vibrate('light') }} className="text-[10px] text-text-muted hover:text-pink-500 tracking-wider">
            LOGOUT
          </button>
        </div>
        {children}
      </>
    )
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!email || !password) {
      showToast('Enter email and password', 'error')
      return
    }
    setSubmitting(true)
    try {
      await login(email, password)
      vibrate('success')
      showToast('Logged in', 'success')
    } catch (err) {
      vibrate('error')
      showToast(err.message || 'Login failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pt-8 animate-fade-up">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center">
          <Lock size={28} className="text-pink-500" />
        </div>
        <h2 className="text-lg font-bold tracking-wider text-text-primary font-[family-name:var(--font-heading)]">RMA ACCESS</h2>
        <p className="text-[12px] text-text-muted mt-1">Login required to access RMA tickets</p>
      </div>

      <GlassCard className="p-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          <Button variant="primary" full type="submit" disabled={submitting}>
            <LogIn size={16} /> {submitting ? 'LOGGING IN...' : 'LOGIN'}
          </Button>
        </form>
      </GlassCard>
    </div>
  )
}
