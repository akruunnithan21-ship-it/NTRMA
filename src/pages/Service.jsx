import { useNavigate } from 'react-router-dom'
import { Plus, MapPin, Monitor } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import { showToast } from '../components/ui/Toast'

export default function Service() {
  const navigate = useNavigate()

  return (
    <div className="space-y-5 pt-4">
      {/* Header */}
      <GlassCard className="p-5 animate-fade-up">
        <h2 className="text-base font-bold tracking-wider text-pink-500 font-[family-name:var(--font-heading)]">SERVICE</h2>
        <p className="text-[11px] text-text-muted mt-1">Create and manage service tickets</p>
      </GlassCard>

      {/* Action buttons */}
      <div className="space-y-3 animate-fade-up">
        {/* New Service Ticket */}
        <GlassCard hoverable className="p-5" onClick={() => navigate('/service/new')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center">
              <Plus size={22} className="text-pink-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-text-primary tracking-wider">NEW SERVICE TICKET</h3>
              <p className="text-[11px] text-text-muted mt-0.5">In-shop diagnostics & repairs</p>
            </div>
          </div>
        </GlassCard>

        {/* Onsite Ticket */}
        <GlassCard hoverable className="p-5" onClick={() => showToast('Onsite tickets coming soon', 'info')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-ice-100 border border-ice-200 flex items-center justify-center">
              <MapPin size={22} className="text-ice-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-text-primary tracking-wider">ONSITE TICKET</h3>
              <p className="text-[11px] text-text-muted mt-0.5">Customer location service</p>
            </div>
            <span className="text-[9px] tracking-wider px-2 py-0.5 rounded-full bg-ice-100 text-ice-500 border border-ice-200 font-medium">SOON</span>
          </div>
        </GlassCard>

        {/* Remote Session Ticket */}
        <GlassCard hoverable className="p-5" onClick={() => showToast('Remote sessions coming soon', 'info')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-center">
              <Monitor size={22} className="text-violet-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-text-primary tracking-wider">REMOTE SESSION</h3>
              <p className="text-[11px] text-text-muted mt-0.5">Remote desktop support</p>
            </div>
            <span className="text-[9px] tracking-wider px-2 py-0.5 rounded-full bg-violet-50 text-violet-500 border border-violet-200 font-medium">SOON</span>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
