import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RotateCcw, Box, ArrowRight } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import StatusPill from '../components/ui/StatusPill'
import useTicketStore from '../store/useTicketStore'
import useRackStore from '../store/useRackStore'
import { formatDate } from '../lib/helpers'

export default function Dashboard() {
  const navigate = useNavigate()
  const { tickets, fetchTickets } = useTicketStore()
  const { items: rackItems, fetchItems: fetchRack } = useRackStore()

  useEffect(() => {
    fetchTickets()
    fetchRack()
  }, [])

  const open = tickets.filter(t => ['Pending', 'Open'].includes(t.status)).length
  const ready = tickets.filter(t => t.status === 'Ready for pick up').length
  const closed = tickets.filter(t => t.status === 'Closed').length
  const recentTickets = tickets.slice(0, 5)

  return (
    <div className="space-y-6 pt-4 stagger">
      {/* Welcome card */}
      <GlassCard className="p-6 animate-fade-up">
        <div className="flex items-center gap-4">
          <img
            src="/assets/logo.svg"
            alt="Neo Tokyo"
            className="w-14 h-14 drop-shadow-[0_0_16px_rgba(231,1,70,0.4)]"
          />
          <div>
            <h2 className="text-lg font-bold tracking-wider text-text-primary">NEO TOKYO</h2>
            <p className="text-[11px] tracking-[3px] text-text-muted mt-0.5">SERVICE DEPARTMENT</p>
          </div>
        </div>
      </GlassCard>

      {/* Quick actions */}
      <div className="flex gap-3 animate-fade-up">
        <Button variant="primary" className="flex-1" onClick={() => navigate('/rma/new')}>
          <Plus size={16} /> NEW RMA
        </Button>
        <Button variant="ghost" className="flex-1" onClick={() => navigate('/rma')}>
          <RotateCcw size={16} /> TICKETS
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 animate-fade-up">
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-text-primary font-mono">{tickets.length}</div>
          <div className="text-[10px] tracking-[2px] text-text-muted mt-1">TOTAL TICKETS</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-pink-500 font-mono">{open}</div>
          <div className="text-[10px] tracking-[2px] text-text-muted mt-1">OPEN</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-amber-500 font-mono">{ready}</div>
          <div className="text-[10px] tracking-[2px] text-text-muted mt-1">READY</div>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="text-2xl font-bold text-emerald-500 font-mono">{rackItems.length}</div>
          <div className="text-[10px] tracking-[2px] text-text-muted mt-1">IN RACK</div>
        </GlassCard>
      </div>

      {/* Recent tickets */}
      <div className="animate-fade-up">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">
            Recent Tickets
          </h3>
          <button
            onClick={() => navigate('/rma')}
            className="text-[10px] tracking-wider text-pink-500 font-medium flex items-center gap-1 hover:underline"
          >
            VIEW ALL <ArrowRight size={12} />
          </button>
        </div>
        
        {recentTickets.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <div className="text-3xl opacity-40 mb-3">📋</div>
            <p className="text-[12px] tracking-wider text-text-muted">No tickets yet</p>
            <Button variant="pink" size="sm" className="mt-4" onClick={() => navigate('/rma/new')}>
              CREATE FIRST TICKET
            </Button>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {recentTickets.map(t => (
              <GlassCard
                key={t.id}
                hoverable
                className="p-4"
                onClick={() => navigate(`/rma/${t.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-text-primary truncate">
                      {t.customer_name || '— No name —'}
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5 truncate">
                      {[t.component_type, t.vendor].filter(Boolean).join(' • ')}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 ml-3">
                    <span className="text-[11px] font-mono text-pink-500">{t.rma_number}</span>
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
