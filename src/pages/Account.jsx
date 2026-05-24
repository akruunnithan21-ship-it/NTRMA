import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, LogOut, User, Mail, Briefcase } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import { showToast } from '../components/ui/Toast'
import useAuthStore from '../store/useAuthStore'
import { vibrate } from '../lib/haptics'

export default function Account() {
  const navigate = useNavigate()
  const { user, displayName, role, logout } = useAuthStore()

  async function handleLogout() {
    try {
      await logout()
      vibrate('light')
      showToast('Logged out', 'success')
      navigate('/')
    } catch (err) {
      showToast('Failed to logout', 'error')
    }
  }

  if (!user) {
    return (
      <div className="space-y-4 pt-4">
        <GlassCard className="p-8 text-center animate-fade-up">
          <User size={48} className="mx-auto text-text-muted mb-4 opacity-40" />
          <p className="text-[12px] text-text-muted tracking-wider">Not logged in</p>
          <p className="text-[11px] text-text-muted mt-2">Login via the RMA section to access your account</p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Back */}
      <div className="flex items-center gap-3 animate-fade-up">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/50 border border-black/10 hover:border-pink-200 transition-all">
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <h2 className="text-base font-bold tracking-wider text-text-primary font-[family-name:var(--font-heading)]">ACCOUNT</h2>
      </div>

      {/* Profile card */}
      <GlassCard className="p-6 animate-fade-up">
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-pink-50 border-3 border-pink-200 flex items-center justify-center overflow-hidden">
              <User size={40} className="text-pink-400" />
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center cursor-pointer shadow-lg">
              <Camera size={14} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={() => showToast('Profile photo coming soon', 'info')} />
            </label>
          </div>

          {/* Name */}
          <h3 className="text-lg font-bold tracking-wider text-text-primary font-[family-name:var(--font-heading)]">
            {displayName || 'User'}
          </h3>
          <span className="mt-1 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[10px] tracking-[2px] text-pink-500 font-medium uppercase">
            {role === 'rma_lead' ? 'SERVICE ENGINEER / RMA LEAD' : 'INVENTORY OFFICER'}
          </span>
        </div>
      </GlassCard>

      {/* Details */}
      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center">
            <User size={16} className="text-pink-500" />
          </div>
          <div>
            <p className="text-[10px] tracking-[2px] text-text-muted uppercase">Name</p>
            <p className="text-sm font-medium text-text-primary">{displayName || '—'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center">
            <Mail size={16} className="text-pink-500" />
          </div>
          <div>
            <p className="text-[10px] tracking-[2px] text-text-muted uppercase">Email</p>
            <p className="text-sm font-medium text-text-primary">{user?.email || '—'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center">
            <Briefcase size={16} className="text-pink-500" />
          </div>
          <div>
            <p className="text-[10px] tracking-[2px] text-text-muted uppercase">Designation</p>
            <p className="text-sm font-medium text-text-primary">
              {role === 'rma_lead' ? 'Service Engineer / RMA Lead' : 'Inventory Officer'}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Logout */}
      <Button variant="danger" full onClick={handleLogout} className="animate-fade-up">
        <LogOut size={16} /> LOGOUT
      </Button>
    </div>
  )
}
