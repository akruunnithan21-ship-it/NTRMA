import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RotateCcw, ArrowRight } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import StatusPill from '../components/ui/StatusPill'
import SearchBar from '../components/ui/SearchBar'
import useTicketStore from '../store/useTicketStore'
import useRackStore from '../store/useRackStore'

export default function Dashboard() {
  const navigate = useNavigate()
  const { tickets, fetchTickets } = useTicketStore()
  const { items: rackItems, fetchItems: fetchRack } = useRackStore()
  const [quickSearch, setQuickSearch] = useState('')

  useEffect(() => { fetchTickets(); fetchRack() }, [])

  const open = tickets.filter(t => ['Pending', 'Open'].includes(t.status)).length
  const ready = tickets.filter(t => t.status === 'Ready for pick up').length

  const searchResults = quickSearch.length > 0
    ? tickets.filter(t => {
        const hay = [t.rma_number, t.customer_name, t.serial_in, t.serial_out, t.vendor, t.component_type].join(' ').toLowerCase()
        return hay.includes(quickSearch.toLowerCase())
      }).slice(0, 5)
    : []

  return (
    <div className="space-y-5 pt-4 stagger">
      {/* Quick search */}
      <div className="relative animate-fade-up">
        <SearchBar value={quickSearch} onChange={setQuickSearch} placeholder="Quick search — name, RMA, serial..." />
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 glass-card-static max-h-64 overflow-y-auto">
            <div className="p-2 space-y-1">
              {searchResults.map(t => (
                <button key={t.id} onClick={() => { setQuickSearch(''); navigate(`/rma/${t.id}`) }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors">
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

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 animate-fade-up">
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-text-primary font-[family-name:var(--font-heading)]">{tickets.length}</div>
          <div className="text-[10px] tracking-[2px] text-text-muted mt-1">TOTAL</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-pink-500 font-[family-name:var(--font-heading)]">{open}</div>
          <div className="text-[10px] tracking-[2px] text-text-muted mt-1">OPEN</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-amber-500 font-[family-name:var(--font-heading)]">{ready}</div>
          <div className="text-[10px] tracking-[2px] text-text-muted mt-1">READY</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-emerald-500 font-[family-name:var(--font-heading)]">{rackItems.length}</div>
          <div className="text-[10px] tracking-[2px] text-text-muted mt-1">IN RACK</div>
        </GlassCard>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 animate-fade-up">
        <Button variant="primary" className="flex-1" onClick={() => navigate('/rma/new')}>
          <Plus size={16} /> NEW RMA
        </Button>
        <Button variant="ghost" className="flex-1" onClick={() => navigate('/rma')}>
          <RotateCcw size={16} /> TICKETS
        </Button>
      </div>

      {/* Recent tickets */}
      <div className="animate-fade-up">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase font-[family-name:var(--font-heading)]">Recent Tickets</h3>
          <button onClick={() => navigate('/rma')} className="text-[10px] tracking-wider text-pink-500 font-medium flex items-center gap-1 hover:underline">
            VIEW ALL <ArrowRight size={12} />
          </button>
        </div>
        {tickets.slice(0, 5).length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-[12px] tracking-wider text-text-muted">No tickets yet</p>
            <Button variant="pink" size="sm" className="mt-4" onClick={() => navigate('/rma/new')}>CREATE FIRST TICKET</Button>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {tickets.slice(0, 5).map(t => (
              <GlassCard key={t.id} hoverable className="p-4" onClick={() => navigate(`/rma/${t.id}`)}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-text-primary truncate">{t.customer_name || '— No name —'}</div>
                    <div className="text-[11px] text-text-muted mt-0.5 truncate">{[t.component_type, t.vendor].filter(Boolean).join(' • ')}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 ml-3">
                    <span className="text-[11px] font-mono text-pink-500">{t.rma_number || '—'}</span>
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
