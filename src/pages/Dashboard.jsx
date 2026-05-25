import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowRight } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import StatusPill from '../components/ui/StatusPill'
import SearchBar from '../components/ui/SearchBar'
import useTicketStore from '../store/useTicketStore'
import * as db from '../lib/database'

export default function Dashboard() {
  const navigate = useNavigate()
  const { tickets, fetchTickets } = useTicketStore()
  const [quickSearch, setQuickSearch] = useState('')
  const [serviceTickets, setServiceTickets] = useState([])

  useEffect(() => { fetchTickets(); loadServiceTickets() }, [])

  async function loadServiceTickets() {
    try { const data = await db.getServiceTickets(); setServiceTickets(data) } catch (e) {}
  }

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const rmaThisMonth = tickets.filter(t => t.created_at >= thisMonthStart)
  const rmaOpen = rmaThisMonth.filter(t => ['Pending', 'Open'].includes(t.status)).length
  const rmaClosed = rmaThisMonth.filter(t => t.status === 'Closed').length
  const rmaReady = rmaThisMonth.filter(t => t.status === 'Ready for pick up').length

  const svcThisMonth = serviceTickets.filter(t => t.created_at >= thisMonthStart)
  const svcOpen = svcThisMonth.filter(t => t.call_status === 'Open').length
  const svcClosed = svcThisMonth.filter(t => t.call_status === 'Closed').length
  const svcPending = svcThisMonth.filter(t => !['Open', 'Closed'].includes(t.call_status)).length

  const searchResults = quickSearch.length > 0
    ? tickets.filter(t => [t.rma_number, t.customer_name, t.serial_in, t.serial_out, t.vendor, t.component_type].join(' ').toLowerCase().includes(quickSearch.toLowerCase())).slice(0, 5)
    : []

  return (
    <div className="space-y-5 pt-4 stagger">
      <div className="relative animate-fade-up">
        <SearchBar value={quickSearch} onChange={setQuickSearch} placeholder="Quick search..." />
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 glass-card-static max-h-64 overflow-y-auto">
            <div className="p-2 space-y-1">
              {searchResults.map(t => (
                <button key={t.id} onClick={() => { setQuickSearch(''); navigate(`/rma/${t.id}`) }} className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-pink-50 transition-colors">
                  <div className="text-left min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">{t.customer_name || '—'}</div>
                    <div className="text-[10px] text-text-muted truncate">{t.component_type} • {t.vendor}</div>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <div className="text-[10px] font-mono text-pink-500">{t.rma_number || '—'}</div>
                    <StatusPill status={t.status} className="mt-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="animate-fade-up">
        <h3 className="text-[10px] tracking-[3px] font-semibold text-text-secondary uppercase mb-2 px-1">RMA — THIS MONTH</h3>
        <div className="grid grid-cols-4 gap-2">
          <GlassCard hoverable className="p-3 text-center" onClick={() => navigate('/rma')}><div className="text-xl font-bold text-text-primary font-[family-name:var(--font-heading)]">{rmaThisMonth.length}</div><div className="text-[8px] tracking-[1.5px] text-text-muted mt-0.5">TOTAL</div></GlassCard>
          <GlassCard hoverable className="p-3 text-center" onClick={() => navigate('/rma')}><div className="text-xl font-bold text-pink-500 font-[family-name:var(--font-heading)]">{rmaOpen}</div><div className="text-[8px] tracking-[1.5px] text-text-muted mt-0.5">OPEN</div></GlassCard>
          <GlassCard hoverable className="p-3 text-center" onClick={() => navigate('/rma')}><div className="text-xl font-bold text-emerald-500 font-[family-name:var(--font-heading)]">{rmaClosed}</div><div className="text-[8px] tracking-[1.5px] text-text-muted mt-0.5">CLOSED</div></GlassCard>
          <GlassCard hoverable className="p-3 text-center" onClick={() => navigate('/rma')}><div className="text-xl font-bold text-amber-500 font-[family-name:var(--font-heading)]">{rmaReady}</div><div className="text-[8px] tracking-[1.5px] text-text-muted mt-0.5">READY</div></GlassCard>
        </div>
      </div>

      <div className="animate-fade-up">
        <h3 className="text-[10px] tracking-[3px] font-semibold text-text-secondary uppercase mb-2 px-1">SERVICE — THIS MONTH</h3>
        <div className="grid grid-cols-4 gap-2">
          <GlassCard hoverable className="p-3 text-center" onClick={() => navigate('/service')}><div className="text-xl font-bold text-text-primary font-[family-name:var(--font-heading)]">{svcThisMonth.length}</div><div className="text-[8px] tracking-[1.5px] text-text-muted mt-0.5">TOTAL</div></GlassCard>
          <GlassCard hoverable className="p-3 text-center" onClick={() => navigate('/service')}><div className="text-xl font-bold text-violet-500 font-[family-name:var(--font-heading)]">{svcOpen}</div><div className="text-[8px] tracking-[1.5px] text-text-muted mt-0.5">OPEN</div></GlassCard>
          <GlassCard hoverable className="p-3 text-center" onClick={() => navigate('/service')}><div className="text-xl font-bold text-emerald-500 font-[family-name:var(--font-heading)]">{svcClosed}</div><div className="text-[8px] tracking-[1.5px] text-text-muted mt-0.5">CLOSED</div></GlassCard>
          <GlassCard hoverable className="p-3 text-center" onClick={() => navigate('/service')}><div className="text-xl font-bold text-orange-500 font-[family-name:var(--font-heading)]">{svcPending}</div><div className="text-[8px] tracking-[1.5px] text-text-muted mt-0.5">PENDING</div></GlassCard>
        </div>
      </div>

      <div className="flex gap-3 animate-fade-up">
        <Button variant="primary" className="flex-1" onClick={() => navigate('/rma/new')}><Plus size={16} /> NEW RMA</Button>
        <Button variant="ghost" className="flex-1" onClick={() => navigate('/service/new')}><Plus size={16} /> NEW SERVICE</Button>
      </div>

      <div className="animate-fade-up">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Recent RMA</h3>
          <button onClick={() => navigate('/rma')} className="text-[10px] tracking-wider text-pink-500 font-medium flex items-center gap-1 hover:underline">VIEW ALL <ArrowRight size={12} /></button>
        </div>
        {tickets.slice(0, 4).length === 0 ? (
          <GlassCard className="p-6 text-center"><p className="text-[12px] tracking-wider text-text-muted">No RMA tickets yet</p></GlassCard>
        ) : (
          <div className="space-y-2">
            {tickets.slice(0, 4).map(t => (
              <GlassCard key={t.id} hoverable className="p-4" onClick={() => navigate(`/rma/${t.id}`)}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-text-primary truncate">{t.customer_name || '—'}</div>
                    <div className="text-[11px] text-text-muted mt-0.5 truncate">{[t.component_type, t.vendor].filter(Boolean).join(' • ')}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 ml-3">
                    <span className="text-[10px] font-mono text-pink-500">{t.rma_number || '—'}</span>
                    <StatusPill status={t.status} />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
