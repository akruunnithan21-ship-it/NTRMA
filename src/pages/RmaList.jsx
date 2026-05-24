import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import SearchBar from '../components/ui/SearchBar'
import GlassCard from '../components/ui/GlassCard'
import StatusPill from '../components/ui/StatusPill'
import Button from '../components/ui/Button'
import useTicketStore from '../store/useTicketStore'
import useSettingsStore from '../store/useSettingsStore'
import { formatDate } from '../lib/helpers'

export default function RmaList() {
  const navigate = useNavigate()
  const { tickets, loading, fetchTickets } = useTicketStore()
  const { getSetting } = useSettingsStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => { fetchTickets() }, [])

  const statuses = ['All', ...( getSetting('statuses') || [])]

  const filtered = tickets.filter(t => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false
    if (!search) return true
    const hay = [t.rma_number, t.customer_name, t.serial_in, t.serial_out, t.vendor, t.component_type, t.component_description, t.defect, t.remarks]
      .join(' ').toLowerCase()
    return hay.includes(search.toLowerCase())
  })

  return (
    <div className="space-y-4 pt-4">
      {/* Search */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search tickets..."
        className="animate-fade-up"
      />

      {/* Status filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide animate-fade-up">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`
              whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] tracking-wider font-medium
              transition-all duration-200 border
              ${statusFilter === s
                ? 'bg-pink-50 text-pink-500 border-pink-200 shadow-[0_4px_12px_rgba(255,79,139,0.1)]'
                : 'bg-white/40 text-text-muted border-white/60 hover:border-pink-100'}
            `}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Ticket count */}
      <div className="flex items-center justify-between px-1 animate-fade-up">
        <span className="text-[11px] tracking-[2px] text-text-muted">
          {filtered.length} TICKET{filtered.length !== 1 ? 'S' : ''}
        </span>
        <Button variant="pink" size="sm" onClick={() => navigate('/rma/new')}>
          <Plus size={14} /> NEW
        </Button>
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <GlassCard key={i} className="p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </GlassCard>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard className="p-10 text-center animate-fade-up">
          <div className="text-4xl opacity-30 mb-3">∅</div>
          <p className="text-[12px] tracking-wider text-text-muted">No tickets found</p>
        </GlassCard>
      ) : (
        <div className="space-y-3 stagger">
          {filtered.map(t => (
            <GlassCard
              key={t.id}
              hoverable
              className="p-4 animate-fade-up"
              onClick={() => navigate(`/rma/${t.id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-text-primary truncate">
                    {t.customer_name || '— No name —'}
                  </div>
                  <div className="text-[11px] text-text-muted mt-1 truncate">
                    {[t.component_type, t.vendor, t.component_description].filter(Boolean).join(' • ')}
                  </div>
                  {t.defect && (
                    <div className="text-[11px] text-text-secondary mt-1.5 line-clamp-1">
                      {t.defect}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-pink-500 font-medium">
                    {t.rma_number}
                  </span>
                  <StatusPill status={t.status} />
                  <span className="text-[10px] text-text-muted">
                    {formatDate(t.submission_date || t.created_at)}
                  </span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
